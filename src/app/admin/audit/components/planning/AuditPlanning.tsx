"use client";

import { useState } from "react";

import { Box, Tab, Tabs } from "@mui/material";

import { Package, FileText, MapPin, Tag } from "lucide-react";

import AuditTypeCard from "./AuditTypeCard";
import AuditPlansTable from "./AuditPlansTable";
// Phase 2 - Cycle Count tracker (shown in its own tab next to the BOM tracker)
import CycleCountPlansTable from "../cycle-count/CycleCountPlansTable";

import { useAssignedBomAuditCount } from "../../hooks/useAssignedBomAuditCount";
import { useAssignedCycleCountCount } from "../../hooks/useAssignedCycleCountCount";
import type { AuditType } from "../../types/audit";

export default function AuditPlanning() {
  const bomCount = useAssignedBomAuditCount();
  const cycleCountCount = useAssignedCycleCountCount();
  const [trackerTab, setTrackerTab] = useState<"bom" | "cycle_count">("bom");
  const gridSx = {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      lg: "repeat(4, 1fr)",
    },
    gap: 2,
  };

  const cards = [
    {
      type: "cycle_count",
      title: "Cycle Count",
      icon: <Package size={18} />,
    },
    {
      type: "bom",
      title: "BOM Completeness",
      icon: <FileText size={18} />,
    },
    {
      type: "location",
      title: "Location Audit",
      icon: <MapPin size={18} />,
    },
    {
      type: "free_stock",
      title: "Free Stock / 4th Axis",
      icon: <Tag size={18} />,
    },
  ] satisfies Array<{
    type: AuditType;
    title: string;
    icon: React.ReactNode;
  }>;

  const assignedCount = (type: AuditType) =>
    type === "bom" ? bomCount : type === "cycle_count" ? cycleCountCount : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box sx={gridSx}>
        {cards.map((card) => (
          <AuditTypeCard
            key={card.type}
            title={card.title}
            icon={card.icon}
            type={card.type}
            count={assignedCount(card.type)}
          />
        ))}
      </Box>

      <Tabs
        value={trackerTab}
        onChange={(_, v) => setTrackerTab(v)}
        sx={{ mt: 2, borderBottom: 1, borderColor: "divider" }}
        aria-label="Audit trackers"
      >
        <Tab value="bom" label="BOM Completeness" sx={{ textTransform: "none", fontWeight: 600 }} />
        <Tab value="cycle_count" label="Cycle Count" sx={{ textTransform: "none", fontWeight: 600 }} />
      </Tabs>

      {trackerTab === "bom" ? <AuditPlansTable /> : <CycleCountPlansTable />}
    </Box>
  );
}
