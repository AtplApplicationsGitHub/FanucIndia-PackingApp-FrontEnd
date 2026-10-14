"use client";

import { Box, Typography } from "@mui/material";

import { Package, FileText, MapPin, Tag } from "lucide-react";

import AuditTypeCard from "./AuditTypeCard";
import StatCard from "./StatCard";
import AuditPlansTable from "./AuditPlansTable";

import { useAuditPlans } from "../../hooks/useAuditPlans";
import { useAuditStats } from "../../hooks/useAuditStats";
import { STALE_AFTER_DAYS, formatAge } from "../../utils/auditAge";

import type { AuditType } from "../../types/audit";

export default function AuditPlanning() {
  const { plans } = useAuditPlans();
  const stats = useAuditStats(plans);

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
      description: "Risk-based physical stock verification.",
      path: "/admin/audit/planning/cycle-count",
      icon: <Package size={18} />,
    },
    {
      type: "bom",
      title: "BOM Completeness",
      description: "Verify disturbed packages against SAP BOM.",
      path: "/admin/audit/planning/bom",
      icon: <FileText size={18} />,
    },
    {
      type: "location",
      title: "Location Audit",
      description: "Verify actual storage locations.",
      path: "/admin/audit/planning/location",
      icon: <MapPin size={18} />,
    },
    {
      type: "free_stock",
      title: "Free Stock / 4th Axis",
      description: "Verify free-stock inventory.",
      path: "/admin/audit/planning/free-stock",
      icon: <Tag size={18} />,
    },
  ] satisfies Array<{
    type: AuditType;
    title: string;
    description: string;
    path: string;
    icon: React.ReactNode;
  }>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
    
      {/* <Box sx={{ ...gridSx, mb: 2 }}>
        <StatCard
          label="Active audits"
          value={stats.activeCount}
          caption={`${stats.createdToday} created today`}
        />

        <StatCard
          label="Records to verify"
          value={stats.records}
          caption={`across ${stats.activeCount} ${
            stats.activeCount === 1 ? "audit" : "audits"
          }`}
        />

        <StatCard
          label="Operators busy"
          value={`${stats.busyCount} of ${stats.operatorTotal}`}
          caption={
            stats.freeOperators.length === 0
              ? "All operators busy"
              : stats.freeOperators.length === 1
                ? `${stats.freeOperators[0]} is free`
                : `${stats.freeOperators.length} operators free`
          }
        />

        <StatCard
          label="Oldest open"
          value={
            stats.oldestAgeDays === null
              ? "-"
              : stats.oldestAgeDays === 0
                ? formatAge(0)
                : `${stats.oldestAgeDays} ${
                    stats.oldestAgeDays === 1 ? "day" : "days"
                  }`
          }
          caption={stats.oldest?.name ?? "No open audits"}
          accent={
            stats.oldestAgeDays !== null &&
            stats.oldestAgeDays >= STALE_AFTER_DAYS
              ? "warning"
              : "primary"
          }
        />
      </Box> */}

      <Box sx={gridSx}>
        {cards.map((card) => (
          <AuditTypeCard
            key={card.type}
            title={card.title}
            description={card.description}
            icon={card.icon}
            path={card.path}
            count={plans.filter((plan) => plan.type === card.type).length}
          />
        ))}
      </Box>

      <AuditPlansTable />
    </Box>
  );
}
