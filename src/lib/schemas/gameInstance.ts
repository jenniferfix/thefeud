import { z } from 'zod';

export const createGameInstanceSchema = z.object({
  gameId: z.string(),
  teamLeft: z.string(),
  teamRight: z.string(),
});

export type CreateGameInstance = z.infer<typeof createGameInstanceSchema>;
