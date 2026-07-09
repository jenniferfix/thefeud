import type { ConfettiMode } from '#/lib/schemas/game';
import {
  type AnswerRecord,
  type GameBoardState,
  gameboardAnswers,
  gameboardState,
} from '#/lib/schemas/gameboard';
import type { GameInstance } from '#/queries/instancequeries';
import { Teams } from '#/types';

type GameQuestion = GameInstance['game']['questions'][number];
type QuestionRow = GameQuestion['question'];
type GameAnswer = QuestionRow['answers'][number];

export type CorrectAnswerStateResult = {
  answer: GameAnswer;
  answerPosition: number;
  changed: boolean;
  state: GameBoardState;
};

export const sortGameAnswers = <T extends GameAnswer>(
  answers: readonly T[],
): T[] => {
  return [...answers].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.createdAt !== b.createdAt) {
      return String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? ''));
    }
    return a.text.localeCompare(b.text);
  });
};

export const createBlankAnswerRecord = (
  question: QuestionRow,
): AnswerRecord => {
  const answers: AnswerRecord = {};

  sortGameAnswers(question.answers).forEach((_answer, index) => {
    answers[index + 1] = null;
  });

  return gameboardAnswers.parse(answers);
};

export const toGameBoardState = (
  gameInstance: GameInstance,
): GameBoardState => {
  return gameboardState.parse({
    gameTitle: gameInstance.game.name,
    leftTeam: gameInstance.leftTeam ?? '',
    rightTeam: gameInstance.rightTeam ?? '',
    leftScore: gameInstance.leftScore,
    rightScore: gameInstance.rightScore,
    roundScore: gameInstance.roundScore,
    strikes: gameInstance.strikes,
    confettiMode: (gameInstance.confettiMode ?? undefined) as
      | ConfettiMode
      | undefined,
    questionTitle: gameInstance.questionText ?? undefined,
    currentQuestionId: gameInstance.currentQuestionId ?? null,
    completedQuestionIds: gameInstance.completedQuestionIds ?? [],
    gameover: Boolean(gameInstance.finished),
    answers: gameboardAnswers.parse(gameInstance.answers ?? {}),
  });
};

export const getAnsweredAnswerIds = (state: GameBoardState): Set<string> => {
  const ids = Object.values(state.answers).flatMap((answer) =>
    answer?.id ? [answer.id] : [],
  );
  return new Set(ids);
};

export const getRemainingQuestions = (
  gameInstance: GameInstance,
  state: GameBoardState,
): GameQuestion[] => {
  const completedQuestionIds = new Set(state.completedQuestionIds);
  return gameInstance.game.questions.filter(
    (gameQuestion) => !completedQuestionIds.has(gameQuestion.question.id),
  );
};

export const mergeGameBoardStateIntoGameInstance = (
  gameInstance: GameInstance,
  state: GameBoardState,
): GameInstance => {
  return {
    ...gameInstance,
    leftTeam: state.leftTeam,
    rightTeam: state.rightTeam,
    leftScore: state.leftScore,
    rightScore: state.rightScore,
    roundScore: state.roundScore,
    strikes: state.strikes,
    answers: state.answers,
    completedQuestionIds: state.completedQuestionIds,
    confettiMode: state.confettiMode,
    questionText: state.questionTitle,
    currentQuestionId: state.currentQuestionId ?? null,
    finished: state.gameover
      ? (gameInstance.finished ?? new Date().toISOString())
      : gameInstance.finished,
    game: {
      ...gameInstance.game,
      name: state.gameTitle,
    },
  };
};

export const createStartQuestionState = (
  gameInstance: GameInstance,
  currentState: GameBoardState,
  questionId: string,
): GameBoardState => {
  const gameQuestion = gameInstance.game.questions.find(
    (q) => q.question.id === questionId,
  );
  if (!gameQuestion) throw Error('Question not found');

  const { question } = gameQuestion;
  return gameboardState.parse({
    ...currentState,
    roundScore: 0,
    strikes: 0,
    answers: createBlankAnswerRecord(question),
    questionTitle: question.text,
    currentQuestionId: question.id,
    confettiMode: 'disabled',
  });
};

export const createCorrectAnswerState = (
  gameInstance: GameInstance,
  currentState: GameBoardState,
  answerId: string,
): CorrectAnswerStateResult => {
  const gameQuestion = gameInstance.game.questions.find(
    (q) => q.question.id === currentState.currentQuestionId,
  );
  if (!gameQuestion) throw Error('Question not found');

  const sortedAnswers = sortGameAnswers(gameQuestion.question.answers);
  const answerIndex = sortedAnswers.findIndex(
    (answer) => answer.id === answerId,
  );
  if (answerIndex < 0) throw Error('Answer not found');

  const answer = sortedAnswers[answerIndex];
  const answerPosition = answerIndex + 1;
  if (getAnsweredAnswerIds(currentState).has(answerId)) {
    return {
      answer,
      answerPosition,
      changed: false,
      state: currentState,
    };
  }

  const updatedAnswers = gameboardAnswers.parse({
    ...currentState.answers,
    [answerPosition]: {
      id: answer.id,
      text: answer.text,
      score: answer.score,
    },
  });

  return {
    answer,
    answerPosition,
    changed: true,
    state: gameboardState.parse({
      ...currentState,
      roundScore: currentState.roundScore + answer.score,
      answers: updatedAnswers,
    }),
  };
};

export const createStrikeState = (
  currentState: GameBoardState,
): GameBoardState => {
  return gameboardState.parse({
    ...currentState,
    strikes: Math.min(currentState.strikes + 1, 3),
  });
};

export const createRoundWinState = (
  currentState: GameBoardState,
  team: Teams,
): GameBoardState => {
  if (!currentState.currentQuestionId) {
    throw Error('Must have started question first');
  }

  const completedQuestionIds = currentState.completedQuestionIds.includes(
    currentState.currentQuestionId,
  )
    ? currentState.completedQuestionIds
    : [...currentState.completedQuestionIds, currentState.currentQuestionId];

  return gameboardState.parse({
    ...currentState,
    leftScore:
      team === Teams.Left
        ? currentState.leftScore + currentState.roundScore
        : currentState.leftScore,
    rightScore:
      team === Teams.Right
        ? currentState.rightScore + currentState.roundScore
        : currentState.rightScore,
    roundScore: 0,
    completedQuestionIds,
    confettiMode: team === Teams.Left ? 'left' : 'right',
  });
};

export const createGameOverState = (
  currentState: GameBoardState,
): GameBoardState => {
  return gameboardState.parse({
    ...currentState,
    gameover: true,
    confettiMode: 'full',
  });
};
