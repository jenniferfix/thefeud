import { describe, expect, it } from 'vitest';
import {
  createCorrectAnswerState,
  createGameOverState,
  createRoundWinState,
  createStartQuestionState,
  getAnsweredAnswerIds,
  getRemainingQuestions,
  toGameBoardState,
} from '#/lib/gameboard-state';
import { gameboardState } from '#/lib/schemas/gameboard';
import type { GameInstance } from '#/queries/instancequeries';
import { Teams } from '#/types';

type GameInstanceRow = NonNullable<GameInstance>;

const buildGameInstance = (
  overrides: Partial<GameInstanceRow> = {},
): GameInstanceRow => ({
  userId: 'user-1',
  gameInstanceId: 'instance-1',
  joinCode: 'ABCDE',
  leftTeam: 'Left',
  rightTeam: 'Right',
  leftScore: 0,
  rightScore: 0,
  roundScore: 0,
  strikes: 0,
  answers: {},
  completedQuestionIds: [],
  confettiMode: 'disabled',
  finished: null,
  questionText: '',
  currentQuestionId: null,
  game: {
    id: 'game-1',
    name: 'Test Game',
    questions: [
      {
        position: 'a0',
        question: {
          id: 'question-1',
          text: 'Question One',
          answers: [
            {
              id: 'answer-low',
              text: 'Low',
              score: 10,
              createdAt: '2026-01-01T00:00:00.000Z',
            },
            {
              id: 'answer-high-new',
              text: 'High New',
              score: 50,
              createdAt: '2026-01-03T00:00:00.000Z',
            },
            {
              id: 'answer-high-old',
              text: 'High Old',
              score: 50,
              createdAt: '2026-01-02T00:00:00.000Z',
            },
          ],
        },
      },
      {
        position: 'a1',
        question: {
          id: 'question-2',
          text: 'Question Two',
          answers: [],
        },
      },
    ],
  },
  ...overrides,
});

describe('gameboard state helpers', () => {
  it('defaults completed question ids when parsing older state', () => {
    const state = gameboardState.parse({
      gameTitle: 'Test Game',
      leftTeam: 'Left',
      rightTeam: 'Right',
      answers: {},
    });

    expect(state.completedQuestionIds).toEqual([]);
  });

  it('starts a question by resetting transient round state', () => {
    const gameInstance = buildGameInstance();
    const currentState = toGameBoardState({
      ...gameInstance,
      roundScore: 25,
      strikes: 2,
      confettiMode: 'left',
    });

    const state = createStartQuestionState(
      gameInstance,
      currentState,
      'question-1',
    );

    expect(state.currentQuestionId).toBe('question-1');
    expect(state.questionTitle).toBe('Question One');
    expect(state.roundScore).toBe(0);
    expect(state.strikes).toBe(0);
    expect(state.confettiMode).toBe('disabled');
    expect(state.answers).toEqual({
      1: null,
      2: null,
      3: null,
    });
  });

  it('reveals an answer with id and prevents double scoring', () => {
    const gameInstance = buildGameInstance();
    const started = createStartQuestionState(
      gameInstance,
      toGameBoardState(gameInstance),
      'question-1',
    );

    const first = createCorrectAnswerState(
      gameInstance,
      started,
      'answer-high-new',
    );
    const second = createCorrectAnswerState(
      gameInstance,
      first.state,
      'answer-high-new',
    );

    expect(first.changed).toBe(true);
    expect(first.answerPosition).toBe(2);
    expect(first.state.roundScore).toBe(50);
    expect(first.state.answers[2]).toEqual({
      id: 'answer-high-new',
      text: 'High New',
      score: 50,
    });
    expect(second.changed).toBe(false);
    expect(second.state.roundScore).toBe(50);
  });

  it('awards a round, resets round score, and completes the question once', () => {
    const gameInstance = buildGameInstance();
    const started = createStartQuestionState(
      gameInstance,
      toGameBoardState(gameInstance),
      'question-1',
    );
    const answered = createCorrectAnswerState(
      gameInstance,
      started,
      'answer-high-old',
    ).state;

    const roundWon = createRoundWinState(answered, Teams.Left);
    const repeated = createRoundWinState(roundWon, Teams.Left);

    expect(roundWon.leftScore).toBe(50);
    expect(roundWon.rightScore).toBe(0);
    expect(roundWon.roundScore).toBe(0);
    expect(roundWon.confettiMode).toBe('left');
    expect(roundWon.completedQuestionIds).toEqual(['question-1']);
    expect(repeated.completedQuestionIds).toEqual(['question-1']);
  });

  it('sets full confetti mode on game over', () => {
    const gameOver = createGameOverState(
      toGameBoardState(buildGameInstance({ leftScore: 100, rightScore: 50 })),
    );

    expect(gameOver.gameover).toBe(true);
    expect(gameOver.confettiMode).toBe('full');
  });

  it('derives remaining questions and answered ids from canonical state', () => {
    const gameInstance = buildGameInstance();
    const started = createStartQuestionState(
      gameInstance,
      toGameBoardState(gameInstance),
      'question-1',
    );
    const answered = createCorrectAnswerState(
      gameInstance,
      started,
      'answer-high-old',
    ).state;
    const roundWon = createRoundWinState(answered, Teams.Right);

    expect([...getAnsweredAnswerIds(roundWon)]).toEqual(['answer-high-old']);
    expect(
      getRemainingQuestions(gameInstance, roundWon).map((q) => q.question.id),
    ).toEqual(['question-2']);
  });
});
