import { z } from 'zod';
import {
  gameInstanceId,
  leftScore,
  questionName,
  rightScore,
  roundScore,
} from './base';
import { answerSchema, gameboardAnswers } from './gameboard';

// export enum GameActions {
//   StartQuestion = 1, // game id
//   CorrectAnswer, // question field, team field
//   Strike, // Team
//   RoundWin,
//   GameOver,
// }
//
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

export const correctAnswerSchema = z.object({
  ...baseData.shape,
  answer: answerSchema,
});

export const roundWinSchema = z.object({
  gameInstanceId: z.string(),
});
