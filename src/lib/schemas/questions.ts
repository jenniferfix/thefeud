import { z } from 'zod';

export const answerFormSchema = z.object({
  id: z.string().optional(),
  answer: z.string(),
  score: z.int(),
});

export const answerSchema = z.object({
  id: z.string(),
  answer: z.string(),
  score: z.int(),
});

export type AnswerType = z.infer<typeof answerSchema>;
export type AnswerFormType = z.infer<typeof answerFormSchema>;

export const questionFormSchema = z.object({
  question: z.string(),
  answers: z.array(answerSchema),
});

export const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  answers: z.array(answerFormSchema),
});

export type QuestionType = z.infer<typeof questionSchema>;
