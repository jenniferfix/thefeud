import { z } from 'zod';
import { questionFormSchema, questionSchema } from './questions';

export const gameSchema = z.object({
  id: z.string(),
  name: z.string(),
  questions: z.array(questionSchema),
});

export const gameFormSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  questions: z.array(questionFormSchema),
});

export type GameType = z.infer<typeof gameSchema>;
