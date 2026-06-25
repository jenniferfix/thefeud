import { z } from 'zod';
import { gameInstanceId } from './base';
import {
  gameboardRequiredState,
  gameboardState,
  gameboardUpdateState,
} from './gameboard';

export const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const OTP_REGEX = '^[A-HJ-NP-Za-hj-np-z2-9]*$';
export const JOIN_CODE_LENGTH = 5;
const codeUsesArray = ['watch'] as const;
const codeUsesEnum = z.enum(codeUsesArray);

export const code = z.string().length(JOIN_CODE_LENGTH);

export const redisCodeStorageSchema = z.object({
  code,
  gameInstanceId,
  use: codeUsesEnum,
  state: gameboardState,
});
export type RedisCodeStorageType = z.infer<typeof redisCodeStorageSchema>;

export const createJoinCodeRPCSchema = z.object({
  gameInstanceId,
  ...gameboardRequiredState.shape,
  use: codeUsesEnum.default('watch'),
});
export type CreateJoinCodeRPCType = z.infer<typeof createJoinCodeRPCSchema>;

export const getJoinCodeGameRPCSchema = z.object({
  code,
});

export const joinCodeFormSchema = z.object({
  ...getJoinCodeGameRPCSchema.shape,
});

export const redisCodeStorageUpdateSchema = z.object({
  code,
  gameInstanceId,
  state: gameboardUpdateState,
});
export type RedisCodeStorageUpdateType = z.infer<
  typeof redisCodeStorageUpdateSchema
>;
