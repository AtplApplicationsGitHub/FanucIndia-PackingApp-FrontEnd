"use client";

import { useState, type ReactNode } from "react";

import { alpha, Box, Chip, Paper, Typography } from "@mui/material";
import {
  Activity,
  CalendarPlus,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  Layers,
  MapPin,
  Package,
  PlayCircle,
  Send,
  User,
  UserCheck,
} from "lucide-react";

import ReconDetailStatCards from "./ReconDetailStatCards";
import ReconciliationPanel from "./ReconciliationPanel";
import AuditMaterialsDialog from "../shared/AuditMaterialsDialog";
import { AUDIT_LABELS } from "../../utils/auditLabels";
import { auditStatusColor, auditStatusLabel } from "../../utils/auditStatus";
import { formatDateTime } from "../../utils/reconLabels";
import type { AuditType } from "../../types/audit";
import type { AuditDetailView } from "../../types/auditDetail";

type Props = {
  auditType: AuditType;
  auditId: number;
  view: AuditDetailView;
};

const EMPTY = "—";

const dateOrEmpty = (value: string | null) =>
  value ? formatDateTime(value) : EMPTY;

export default function AuditProgressDetail({
  auditType,
  auditId,
  view,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState(view.status);

  const awaitingUpload = status === "ASSIGNED" || status === "IN_PROGRESS";
  const viewLabel = "Audit Materials";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: 1.5,
        bgcolor: "background.paper",
        mt: -2,
        mb: -2,
        px: { xs: 2, md: 3 },
        pt: 1.25,
        pb: 2,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", px: 1 }}>
        <Typography
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: 17, sm: 20 },
            letterSpacing: 0.5,
            textAlign: "center",
            textTransform: "uppercase",
            wordBreak: "break-word",
          }}
        >
          <Box component="span" sx={{ color: "error.main" }}>
            {view.auditName}
          </Box>
          <Box component="span" sx={{ color: "text.secondary" }}>
            {" - "}
            {view.auditNo}
          </Box>
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, minmax(0, 1fr))",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(6, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        <InfoCard icon={<Layers size={18} />} label="Type" value={AUDIT_LABELS[auditType]} />
        <InfoCard icon={<Activity size={18} />} label="Status">
          <Chip
            size="small"
            label={auditStatusLabel(status)}
            color={auditStatusColor(status)}
            sx={{ fontWeight: 700, height: 22 }}
          />
        </InfoCard>
        <InfoCard icon={<User size={18} />} label="Created By" value={view.createdByName || EMPTY} />
        <InfoCard icon={<CalendarPlus size={18} />} label="Created At" value={dateOrEmpty(view.createdAt)} />
        <InfoCard icon={<FileSpreadsheet size={18} />} label="File Name" value={view.sourceFile || EMPTY} />
        <InfoCard icon={<UserCheck size={18} />} label="Operator Name" value={view.operatorName || EMPTY} />

        <InfoCard icon={<Download size={18} />} label="Downloaded On" value={dateOrEmpty(view.downloadedAt)} />
        <InfoCard icon={<PlayCircle size={18} />} label="Started On" value={dateOrEmpty(view.startedAt)} />
        <InfoCard icon={<Send size={18} />} label="Submitted On" value={dateOrEmpty(view.submittedAt)} />
        <InfoCard icon={<MapPin size={18} />} label="Total Locations" value={view.totalLocations} />
        <InfoCard icon={<Package size={18} />} label={view.itemsLabel} value={view.totalItems} />
        <InfoCard
          icon={<Eye size={18} />}
          label="View"
          value={viewLabel}
          onClick={() => setDialogOpen(true)}
        />

        {view.extraFields.map((field) => (
          <InfoCard
            key={field.label}
            icon={<Layers size={18} />}
            label={field.label}
            value={field.value || EMPTY}
          />
        ))}
      </Box>

      {!awaitingUpload &&
        (auditType === "bom" ? (
          <ReconciliationPanel
            auditType={auditType}
            auditId={auditId}
            onAuditStatusChange={setStatus}
          />
        ) : (
          <ReconDetailStatCards expected={view.totalItems} />
        ))}

      <AuditMaterialsDialog
        open={dialogOpen}
        title={viewLabel}
        rows={view.rows}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}

function InfoCard({
  icon,
  label,
  value,
  children,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value?: string | number;
  children?: ReactNode;
  onClick?: () => void;
}) {
  const clickable = Boolean(onClick);

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        minWidth: 0,
        minHeight: 64,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
        bgcolor: "background.paper",
        cursor: clickable ? "pointer" : "default",
        transition: "border-color .15s, box-shadow .15s, background-color .15s",
        ...(clickable && {
          "&:hover, &:focus-visible": {
            outline: "none",
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            boxShadow: "0 2px 8px rgba(16, 24, 40, 0.10)",
          },
        }),
      })}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          borderRadius: 1.5,
          color: "primary.contrastText",
          bgcolor: "primary.main",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "text.secondary",
            lineHeight: 1.4,
          }}
          noWrap
        >
          {label}
        </Typography>
        {children ?? (
          <Typography
            title={value !== undefined ? String(value) : undefined}
            sx={{ fontSize: 14, fontWeight: 700, color: "text.primary", lineHeight: 1.4 }}
            noWrap
          >
            {value}
          </Typography>
        )}
      </Box>
      {clickable && <ChevronRight size={18} />}
    </Paper>
  );
}
