import { z } from 'zod';

export const gameboardRouteURLPropsSchema = z.object({
  isiframe: z.boolean().optional(),
});
