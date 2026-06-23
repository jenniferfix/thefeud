import { z } from 'zod';

export const score = z.number();
export const gameId = z.string();
export const gameInstanceId = z.string();
export const gameover = z.boolean();
export const gameTitle = z.string();
export const questionName = z.string();
export const roundScore = score;
export const leftScore = score;
export const rightScore = score;
export const teamName = z.string();
