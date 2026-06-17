import { z } from 'zod';

export const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const OTP_REGEX = '^[A-HJ-NP-Za-hj-np-z2-9]*$';
export const JOIN_CODE_LENGTH = 5;
const codeUsesArray = ['watch'] as const;
const codeUsesEnum = z.enum(codeUsesArray);

export const code = z.string().length(JOIN_CODE_LENGTH);
export const gameInstanceId = z.string();

export const redisCodeStorageSchema = z.object({
  code,
  gameInstanceId: z.string(),
  use: codeUsesEnum,
});
export type RedisCodeStorageType = z.infer<typeof redisCodeStorageSchema>;

export const createJoinCodeRPCSchema = z.object({
  gameInstanceId,
  use: codeUsesEnum.default('watch'),
});
export type CreateJoinCodeRPCType = z.infer<typeof createJoinCodeRPCSchema>;

export const getJoinCodeGameRPCSchema = z.object({
  code,
});

export const joinCodeFormSchema = z.object({
  ...getJoinCodeGameRPCSchema.shape,
});
