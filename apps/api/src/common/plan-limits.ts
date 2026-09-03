export const PLAN_LIMITS = {
  free: { maxProjects: 1 },
  premium: { maxProjects: Infinity },
} as const;

export type PlanId = keyof typeof PLAN_LIMITS;
