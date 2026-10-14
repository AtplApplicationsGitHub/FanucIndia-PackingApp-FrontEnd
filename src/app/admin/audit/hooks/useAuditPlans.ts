"use client";

import { useEffect, useState } from "react";
import type { AuditPlan } from "../types/audit";

const KEY = "fanuc_audit_plans";

export function useAuditPlans() {
  const [plans, setPlans] = useState<AuditPlan[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem(KEY);
        setPlans(saved ? JSON.parse(saved) : []);
      } catch {
        setPlans([]);
      }
    };

    load();

    window.addEventListener("audit-plans-updated", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("audit-plans-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const savePlan = (plan: AuditPlan) => {
    const existing = JSON.parse(
      localStorage.getItem(KEY) || "[]",
    ) as AuditPlan[];

    const updated = [plan, ...existing];

    localStorage.setItem(KEY, JSON.stringify(updated));
    setPlans(updated);

    window.dispatchEvent(new Event("audit-plans-updated"));
  };

  const deletePlan = (id: string) => {
    const existing = JSON.parse(
      localStorage.getItem(KEY) || "[]",
    ) as AuditPlan[];

    const updated = existing.filter((plan) => plan.id !== id);

    localStorage.setItem(KEY, JSON.stringify(updated));
    setPlans(updated);

    window.dispatchEvent(new Event("audit-plans-updated"));
  };

  return { plans, savePlan, deletePlan };
}
