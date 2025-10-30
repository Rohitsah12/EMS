import { z } from 'zod';

export const getDashboardStatsSchema = z.object({
  query: z.object({
    attendanceDays: z.coerce.number().int().min(1).default(5),
    leaveDays: z.coerce.number().int().min(1).default(5),
  }),
});

export type GetDashboardStatsQuery = z.infer<
  typeof getDashboardStatsSchema
>['query'];