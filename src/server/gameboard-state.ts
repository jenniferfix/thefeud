import type { ConfettiMode } from '#/lib/schemas/game';
import {
  type AnswerRecord,
  type GameBoardState,
  gameboardAnswers,
  gameboardState,
} from '#/lib/schemas/gameboard';
import type { GameInstance } from '#/queries/instancequeries';

type GameInstanceRow = NonNullable<GameInstance>;
type QuestionRow = GameInstanceRow['game']['questions'][number]['question'];

export const createBlankAnswerRecord = (
  question: QuestionRow,
): AnswerRecord => {
  const answers: AnswerRecord = {};

  question.answers.forEach((_answer, index) => {
    answers[index + 1] = null;
  });

  return answers;
};

export const toGameBoardState = (
  gameInstance: GameInstanceRow,
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
    gameover: Boolean(gameInstance.finished),
    answers: gameboardAnswers.parse(gameInstance.answers ?? {}),
  });
};
