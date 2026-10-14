"use client";

import { useMemo } from "react";

import { MOCK_OPERATORS } from "../mock/auditMockData";
import type { AuditPlan } from "../types/audit";
import { getAgeInDays } from "../utils/auditAge";

export function useAuditStats(plans: AuditPlan[]) {
  return useMemo(() => {
    const active = plans.filter((plan) => plan.status === "Assigned");

    const createdToday = active.filter(
      (plan) => getAgeInDays(plan.createdAt) === 0,
    ).length;

    const records = active.reduce((sum, plan) => sum + plan.rows.length, 0);

    const busyOperators = new Set(active.map((plan) => plan.operator));

    const freeOperators = MOCK_OPERATORS.filter(
      (operator) => !busyOperators.has(operator),
    );

    const oldest = active.reduce<AuditPlan | null>(
      (current, plan) =>
        !current || new Date(plan.createdAt) < new Date(current.createdAt)
          ? plan
          : current,
      null,
    );

    return {
      activeCount: active.length,
      createdToday,
      records,
      busyCount: busyOperators.size,
      operatorTotal: MOCK_OPERATORS.length,
      freeOperators,
      oldest,
      oldestAgeDays: oldest ? getAgeInDays(oldest.createdAt) : null,
    };
  }, [plans]);
}
