import { z } from 'zod';

export const answerSchema = z.object({
  answer: z.string(),
  score: z.int(),
});
export type AnswerType = z.infer<typeof answerSchema>;

export const questionSchema = z.object({
  question: z.string(),
  answers: z.array(answerSchema),
});

export type QuestionType = z.infer<typeof questionSchema>;
