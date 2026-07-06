import { z } from 'zod';
import { gameId, teamName } from './base';

export const createGameInstanceSchema = z.object({
  gameId,
  teamLeft: teamName,
  teamRight: teamName,
});

export type CreateGameInstance = z.infer<typeof createGameInstanceSchema>;
