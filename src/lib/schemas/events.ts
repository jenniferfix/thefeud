import { ZodAny, ZodObject, z } from 'zod';
import {
  gameover,
  leftScore,
  questionName,
  rightScore,
  roundScore,
  strikes,
  team,
} from './base';
import { answerSchema, gameboardAnswers } from './gameboard';

export const actionsArray = [
  'StartQuestion',
  'CorrectAnswer',
  'Strike',
  'RoundWin',
  'GameOver',
] as const;
export const actionsEnum = z.enum(actionsArray);
export type ActionType = z.infer<typeof actionsEnum>;

export const baseData = z.object({
  roundScore,
  leftScore,
  rightScore,
});

export const startQuestionSchema = z.object({
  ...baseData.shape,
  questionName,
  answers: gameboardAnswers,
});
export type StartQuestionType = z.infer<typeof startQuestionSchema>;

export const correctAnswerSchema = z.object({
  ...baseData.shape,
  answer: answerSchema,
  team,
});
export type CorrectAnswerType = z.infer<typeof correctAnswerSchema>;

export const strikeSchema = z.object({
  ...baseData.shape,
  strikes,
});
export type StrikeType = z.infer<typeof strikeSchema>;

export const roundWinSchema = z.object({
  ...baseData.shape,
  gameInstanceId: z.string(),
  team,
});
export type RoundWinType = z.infer<typeof roundWinSchema>;

export const gameOverSchema = z.object({
  ...baseData.shape,
  gameover,
});
export type GameOverType = z.infer<typeof gameOverSchema>;

export const EventSchema = {
  StartQuestion: startQuestionSchema,
  Strike: strikeSchema,
  CorrectAnswer: correctAnswerSchema,
  RoundWin: roundWinSchema,
  GameOver: gameOverSchema,
} satisfies Record<ActionType, z.ZodObject>;
