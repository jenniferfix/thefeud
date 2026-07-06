import { z } from 'zod';
import {
  actionsEnum,
  answerId,
  gameInstanceId,
  leftScore,
  questionId,
  rightScore,
  roundScore,
  team,
} from './base';
import { gameSoundEnum } from './events';

export const baseData = z.object({
  roundScore,
  leftScore,
  rightScore,
});

export const startQuestionSchema = z.object({
  questionId,
});
export type StartQuestionEvent = z.infer<typeof startQuestionSchema>;

export const correctAnswerSchema = z.object({
  answerId,
});
export type CorrectAnswerEvent = z.infer<typeof correctAnswerSchema>;

export const strikeSchema = z.object({});
export type StrikeType = z.infer<typeof strikeSchema>;

export const roundWinSchema = z.object({
  team,
});
export type RoundWinType = z.infer<typeof roundWinSchema>;

export const gameOverSchema = z.object({});
export type GameOverType = z.infer<typeof gameOverSchema>;

export const backendEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(actionsEnum.enum.StartQuestion),
    gameInstanceId,
    data: startQuestionSchema,
  }),
  z.object({
    type: z.literal(actionsEnum.enum.CorrectAnswer),
    gameInstanceId,
    data: correctAnswerSchema,
  }),
  z.object({
    type: z.literal(actionsEnum.enum.Strike),
    gameInstanceId,
    data: strikeSchema,
  }),
  z.object({
    type: z.literal(actionsEnum.enum.RoundWin),
    gameInstanceId,
    data: roundWinSchema,
  }),
  z.object({
    type: z.literal(actionsEnum.enum.GameOver),
    gameInstanceId,
    data: gameOverSchema,
  }),
]);
export type BackendEventType = z.infer<typeof backendEventSchema>;

export const sendGameSoundSchema = z.object({
  gameInstanceId,
  sound: gameSoundEnum,
});
