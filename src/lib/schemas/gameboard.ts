import { z } from 'zod';
import {
  answerNumber,
  gameId,
  gameInstanceId,
  gameover,
  gameTitle,
  leftScore,
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
  questionName: questionName.default(''),
  roundScore: roundScore.default(0),
  leftScore: leftScore.default(0),
  rightScore: rightScore.default(0),
  strikes: strikes.default(0),
  confettiMode: confettiModeEnum.default('disabled'),
  answers: gameboardAnswers,
});
export type GameBoardState = z.infer<typeof gameboardState>;
