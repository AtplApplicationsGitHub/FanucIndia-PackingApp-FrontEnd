"use client";
import { useState, type ReactNode } from "react";
import { alpha, Box, Chip, Paper, Typography } from "@mui/material";
import {
  Activity,
  CalendarPlus,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Flag,
  Layers,
  MapPin,
  Package,
  Send,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import AuditTimeline, { type AuditTimelineStep } from "./AuditTimeline";
import ReconciliationPanel from "./ReconciliationPanel";
import AuditStatusPill from "../shared/AuditStatusPill";
import AuditTableDialog from "../shared/AuditTableDialog";
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
export default function AuditProgressDetail({
  auditType,
  auditId,
  view,
}: Props) {
  const [uploadsOpen, setUploadsOpen] = useState(false);
  const [status, setStatus] = useState(view.status);
  const awaitingUpload = status === "ASSIGNED" || status === "IN_PROGRESS";
  const uploads = awaitingUpload ? view.locationUploads : null;
  const uploadedCount = uploads?.filter((l) => l.uploadedAt).length ?? 0;
  const [closedAt, setClosedAt] = useState<string | null>(null);
  const [closedByName, setClosedByName] = useState<string | null>(null);
  const steps: AuditTimelineStep[] = [
    {
      key: "created",
      label: "Created",
      icon: <CalendarPlus size={18} />,
      at: view.createdAt,
      by: view.createdByName,
    },
    {
      key: "downloaded",
      label: "Downloaded",
      icon: <Download size={18} />,
      at: view.downloadedAt,
    },
    {
      key: "started",
      label: "Started",
      icon: <Flag size={18} />,
      at: view.startedAt,
    },
    {
      key: "submitted",
      label: "Submitted",
      icon: <Send size={18} />,
      at: view.submittedAt,
    },
    {
      key: "closed",
      label: "Closed",
      icon: <CheckCircle2 size={18} />,
      at: closedAt,
      by: closedByName,
    },
  ].map((s) => ({
    ...s,
    reached: Boolean(s.at) || (s.key === "closed" && status === "CLOSED"),
  }));
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
      <AuditTimeline steps={steps} />
      {auditType !== "bom" && (
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
        <InfoCard icon={<Layers size={18} />} label={view.auditNo}>
          <Typography
            title={view.auditName}
            noWrap
            sx={{
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            {view.auditName}
          </Typography>
          <Typography
            title={AUDIT_LABELS[auditType]}
            noWrap
            sx={{
              fontSize: 12,
              color: "text.secondary",
              lineHeight: 1.3,
            }}
          >
            {AUDIT_LABELS[auditType]}
          </Typography>
        </InfoCard>
        <InfoCard icon={<Activity size={18} />} label="Status">
          <Chip
            size="small"
            label={auditStatusLabel(status)}
            color={auditStatusColor(status)}
            sx={{ fontWeight: 700, height: 22 }}
          />
        </InfoCard>
        <InfoCard
          icon={<FileSpreadsheet size={18} />}
          label="File Name"
          value={view.sourceFile || EMPTY}
        />
        <InfoCard
          icon={<UserCheck size={18} />}
          label="Operator Name"
          value={view.operatorName || EMPTY}
        />
        {uploads ? (
          <InfoCard
            icon={<MapPin size={18} />}
            label="Total Locations"
            value={`${view.totalLocations} · ${uploadedCount} uploaded`}
            onClick={() => setUploadsOpen(true)}
          />
        ) : (
          <InfoCard
            icon={<MapPin size={18} />}
            label="Total Locations"
            value={view.totalLocations}
          />
        )}
        <InfoCard
          icon={<Package size={18} />}
          label={view.itemsLabel}
          value={view.totalItems}
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
      )}
      <ReconciliationPanel
        auditType={auditType}
        auditId={auditId}
        auditStatus={status}
        pending={auditType !== "bom" || status === "ASSIGNED"}
        expectedLines={view.totalItems}
        onAuditStatusChange={setStatus}
        onClosedAtChange={setClosedAt}
        onClosedByNameChange={setClosedByName}
        pendingRows={view.rows}
        locationUploads={view.locationUploads}
        headerCards={auditType === "bom" ? (
          <>
        <InfoCard icon={<Layers size={18} />} label={view.auditNo}>
          <Typography
            title={view.auditName}
            noWrap
            sx={{
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            {view.auditName}
          </Typography>
          <Typography
            title={AUDIT_LABELS[auditType]}
            noWrap
            sx={{
              fontSize: 12,
              color: "text.secondary",
              lineHeight: 1.3,
            }}
          >
            {AUDIT_LABELS[auditType]}
          </Typography>
        </InfoCard>
        <InfoCard icon={<Activity size={18} />} label="Status">
          <Chip
            size="small"
            label={auditStatusLabel(status)}
            color={auditStatusColor(status)}
            sx={{
              fontWeight: 700,
              fontSize: status === "RECONCILIATION_PENDING" ? 10 : undefined,
              height: "auto",
              minHeight: 22,
              maxWidth: "100%",
              "& .MuiChip-label": {
                whiteSpace: "normal",
                overflow: "visible",
                textOverflow: "clip",
                textAlign: "center",
                lineHeight: 1.3,
                px: 0.75,
                py: 0.4,
              },
            }}
          />
        </InfoCard>
        <InfoCard
          icon={<UserCheck size={18} />}
          label="Operator Name"
          value={view.operatorName || EMPTY}
        />
          </>
        ) : undefined}
      />
      {auditType !== "bom" && uploads && (
        <AuditTableDialog
          open={uploadsOpen}
          title={`LOCATION UPLOAD STATUS (${uploadedCount} / ${uploads.length})`}
          width={680}
          columns={[
            { label: "Storage Bin" },
            { label: "Materials", align: "right" },
            { label: "Status", align: "center" },
            { label: "Uploaded On" },
          ]}
          rows={uploads.map((l) => [
            l.storageBin,
            l.expectedMaterials,
            <AuditStatusPill
              key="status"
              label={l.uploadedAt ? "Uploaded" : "Pending"}
              color={l.uploadedAt ? "success" : "warning"}
            />,
            <Box key="uploadedOn" component="span" sx={{ whiteSpace: "nowrap" }}>
              {l.uploadedAt ? formatDateTime(l.uploadedAt) : EMPTY}
            </Box>,
          ])}
          emptyText="No locations found."
          onClose={() => setUploadsOpen(false)}
        />
      )}
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
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1.4,
            }}
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
