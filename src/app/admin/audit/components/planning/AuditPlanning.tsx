"use client";

import { Box} from "@mui/material";

import { Package, FileText, MapPin, Tag } from "lucide-react";

import AuditTypeCard from "./AuditTypeCard";
import AuditPlansTable from "./AuditPlansTable";

import { useAssignedBomAuditCount } from "../../hooks/useAssignedBomAuditCount";
import type { AuditType } from "../../types/audit";

export default function AuditPlanning() {
  const bomCount = useAssignedBomAuditCount();
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box sx={gridSx}>
        {cards.map((card) => (
          <AuditTypeCard
            key={card.type}
            title={card.title}
            icon={card.icon}
            type={card.type}
            count={card.type === "bom" ? bomCount : 0}
          />
        ))}
      </Box>

      <AuditPlansTable />
    </Box>
  );
}
