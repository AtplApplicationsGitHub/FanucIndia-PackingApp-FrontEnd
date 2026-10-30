"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Box } from "@mui/material";
import { Package, FileText, MapPin, Tag } from "lucide-react";

import AuditTypeCard from "./AuditTypeCard";
import AuditPlansTable from "./AuditPlansTable";

import { useAuditCounts } from "../../hooks/useAuditCounts";

import type { AuditType } from "../../types/audit";
import { AUDIT_LABELS } from "../../utils/auditLabels";
import { parsePlanningTab, planningRoute } from "../../utils/auditRoutes";

const gridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    lg: "repeat(4, 1fr)",
  },
  gap: 2,
};

const CARDS = [
  { type: "cycle_count", icon: <Package size={18} /> },
  { type: "bom", icon: <FileText size={18} /> },
  { type: "location", icon: <MapPin size={18} /> },
  { type: "free_stock", icon: <Tag size={18} /> },
] satisfies Array<{ type: AuditType; icon: React.ReactNode }>;

export default function AuditPlanning() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { counts, statusCounts } = useAuditCounts();

  // The selected stat card (= the audit type listed below) lives in the URL: ?tab=
  const selected = parsePlanningTab(searchParams.get("tab"));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {/* Four audit cards - clicking one loads that audit type in the table below */}
      <Box sx={{ ...gridSx, px: 2 }}>
        {CARDS.map((card) => (
          <AuditTypeCard
            key={card.type}
            title={AUDIT_LABELS[card.type]}
            icon={card.icon}
            type={card.type}
            count={counts[card.type]}
            selected={card.type === selected}
            onSelect={() =>
              router.replace(planningRoute(card.type), { scroll: false })
            }
          />
        ))}
      </Box>

      {/* key = audit type: switching cards resets search / filter / page and refetches */}
      <AuditPlansTable
        key={selected}
        auditType={selected}
        statusCounts={statusCounts[selected]}
      />
    </Box>
  );
}
