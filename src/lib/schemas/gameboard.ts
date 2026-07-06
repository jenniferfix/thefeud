import { z } from 'zod';
import {
  answerId,
  answerNumber,
  gameover,
  gameTitle,
  leftScore,
  questionId,
  questionName,
  rightScore,
  roundScore,
  score,
  strikes,
  teamName,
} from './base';
import { confettiModeEnum } from './game';

export const gameboardRouteURLPropsSchema = z.object({
  isiframe: z.boolean().optional(),
});

export const answerSchema = z.object({
  id: answerId.optional(),
  text: questionName,
  score,
});
export type Answer = z.infer<typeof answerSchema>;

export const gameboardAnswers = z.record(answerNumber, answerSchema.nullable());
export type AnswerRecord = z.infer<typeof gameboardAnswers>;

export const gameboardRequiredState = z.object({
  leftTeam: teamName,
  rightTeam: teamName,
  gameTitle: gameTitle,
});

export const gameboardState = z.object({
  ...gameboardRequiredState.shape,
  gameover: gameover.default(false),
  questionTitle: questionName.default(''),
  roundScore: roundScore.default(0),
  leftScore: leftScore.default(0),
  rightScore: rightScore.default(0),
  strikes: strikes.default(0),
  confettiMode: confettiModeEnum.default('disabled'),
  answers: gameboardAnswers,
  currentQuestionId: questionId.nullable().optional(),
  completedQuestionIds: z.array(questionId).default([]),
});
export type GameBoardState = z.infer<typeof gameboardState>;

export const gameboardUpdateState = z.object({
  leftTeam: teamName.optional(),
  rightTeam: teamName.optional(),
  gameTitle: teamName.optional(),
  gameover: gameover.optional(),
  questionTitle: questionName.optional(),
  roundScore: roundScore.optional(),
  leftScore: leftScore.optional(),
  rightScore: rightScore.optional(),
  strikes: strikes.optional(),
  confettiMode: confettiModeEnum.optional(),
  answers: gameboardAnswers.optional(),
  currentQuestionId: questionId.nullable().optional(),
  completedQuestionIds: z.array(questionId).optional(),
});
export type GameboardUpdateType = z.infer<typeof gameboardUpdateState>;
