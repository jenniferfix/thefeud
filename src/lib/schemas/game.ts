import { z } from 'zod';
import { gameId, gameTitle } from './base';
import {
  gameQuestionSchema,
  questionFormSchema,
  questionSchema,
} from './questions';

export const confettiModeArray = ['full', 'left', 'right', 'disabled'] as const;
export const confettiModeEnum = z.enum(confettiModeArray);
export type ConfettiMode = z.infer<typeof confettiModeEnum>;

export const gameSchema = z.object({
  id: gameId,
  name: gameTitle,
  questions: z.array(gameQuestionSchema),
});

export const gameFormSchema = z.object({
  id: z.string().optional(),
  name: gameTitle,
  questions: z.array(questionFormSchema),
});

export type GameType = z.infer<typeof gameSchema>;
