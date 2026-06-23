import { z } from 'zod';
import {
  gameId,
  gameInstanceId,
  gameover,
  gameTitle,
  leftScore,
  questionName,
  rightScore,
  roundScore,
  score,
  teamName,
} from './base';

export const gameboardRouteURLPropsSchema = z.object({
  isiframe: z.boolean().optional(),
});

export const answerSchema = z.object({
  text: questionName,
  score,
});

export const gameboardAnswers = z.record(z.int(), answerSchema.nullable());

export const gameboardRequiredState = z.object({
  gameInstanceId,
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
  strikes: z.int().default(0),
  answers: gameboardAnswers,
});
export type GameBoardState = z.infer<typeof gameboardState>;
