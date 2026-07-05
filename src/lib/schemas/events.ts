import { z } from 'zod';
import {
  type ActionType,
  actionsEnum,
  answerId,
  gameover,
  leftScore,
  questionName,
  rightScore,
  roundScore,
  strikes,
  team,
} from './base';
import { answerSchema, gameboardAnswers, gameboardState } from './gameboard';

export const sentEvent = z.object({
  type: actionsEnum,
  state: gameboardState,
});
export type SentEvent = z.infer<typeof sentEvent>;

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

export const eventAnswerSchema = answerSchema.extend({
  id: answerId,
  position: z.int(),
});
export type EventCorrectAnswerType = z.infer<typeof eventAnswerSchema>;

export const correctAnswerSchema = z.object({
  ...baseData.shape,
  answer: eventAnswerSchema,
});
export type CorrectAnswerType = z.infer<typeof correctAnswerSchema>;

export const strikeSchema = z.object({
  ...baseData.shape,
  strikes,
});
export type StrikeType = z.infer<typeof strikeSchema>;

export const roundWinSchema = z.object({
  ...baseData.shape,
  team,
});
export type RoundWinType = z.infer<typeof roundWinSchema>;

export const gameOverSchema = z.object({
  ...baseData.shape,
  gameover,
});
export type GameOverType = z.infer<typeof gameOverSchema>;

export const eventPayloadSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(actionsEnum.enum.StartQuestion),
    data: startQuestionSchema,
  }),
  z.object({
    type: z.literal(actionsEnum.enum.CorrectAnswer),
    data: correctAnswerSchema,
  }),
  z.object({
    type: z.literal(actionsEnum.enum.Strike),
    data: strikeSchema,
  }),
  z.object({
    type: z.literal(actionsEnum.enum.RoundWin),
    data: roundWinSchema,
  }),
  z.object({
    type: z.literal(actionsEnum.enum.GameOver),
    data: gameOverSchema,
  }),
]);

export const EventPayloadSchema = {
  StartQuestion: startQuestionSchema,
  Strike: strikeSchema,
  CorrectAnswer: correctAnswerSchema,
  RoundWin: roundWinSchema,
  GameOver: gameOverSchema,
} satisfies Record<ActionType, z.ZodObject>;

export type PayloadDataMap = {
  [K in ActionType]: z.infer<(typeof EventPayloadSchema)[K]>;
};

export type Payload<T extends ActionType> = {
  type: T;
  data: PayloadDataMap[T];
};

export type CreatePayloadResult =
  | { success: true; payload: string }
  | { success: false; error: z.ZodError };

export const createPayload = <T extends ActionType>(
  event: T,
  data: PayloadDataMap[T],
): CreatePayloadResult => {
  const result = EventPayloadSchema[event].safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error };
  }
  return {
    success: true,
    payload: JSON.stringify(result.data),
  };
};

export type EventPayload = z.infer<typeof eventPayloadSchema>;

export type ParsePayloadResult =
  | { success: true; payload: EventPayload }
  | { success: false; error: z.ZodError | SyntaxError };

export const parsePayload = (raw: string): ParsePayloadResult => {
  let json: unknown;

  try {
    json = JSON.parse(raw);
  } catch (err) {
    return { success: false, error: err as SyntaxError };
  }

  const result = eventPayloadSchema.safeParse(json);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, payload: result.data };
};

export const gameSoundEnum = z.enum([
  'ding',
  'strike',
  'faceOffMusic',
  'faceOffBuzzer',
  'themeMusic',
  'clap',
]);
export type GameSound = z.infer<typeof gameSoundEnum>;

export const soundEvent = z.object({
  sound: gameSoundEnum,
});

export const gameEventSchema = z.discriminatedUnion('kind', [
  sentEvent.extend({ kind: z.literal('action') }),
  soundEvent.extend({ kind: z.literal('sound') }),
]);
export type GameEvent = z.infer<typeof gameEventSchema>;
