"use client";

import {
  Box,
  alpha,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Download, Hourglass } from "lucide-react";

import CommonButton from "@/common/components/CommonButton";
import { KVBox } from "@/app/so-search/components/KVBox";
import AuditExcelPreview from "../bom/AuditExcelPreview";
import ReconDetailStatCards from "./ReconDetailStatCards";
import { AUDIT_LABELS } from "../../utils/auditLabels";
import { auditStatusColor, auditStatusLabel } from "../../utils/auditStatus";
import { formatDateTime } from "../../utils/reconLabels";
import type { AuditType } from "../../types/audit";
import type { AuditDetailView } from "../../types/auditDetail";

type Props = {
  auditType: AuditType;
  view: AuditDetailView;
  onBack: () => void;
  /** Present only when the audit has a downloadable report (submitted BOM audit) */
  onDownloadReport?: () => void;
  downloading?: boolean;
};

export default function AuditProgressDetail({
  auditType,
  view,
  onBack,
  onDownloadReport,
  downloading = false,
}: Props) {
  const awaitingUpload =
    view.status === "ASSIGNED" || view.status === "IN_PROGRESS";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, gap: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {view.auditNo} – {view.auditName}
        </Typography>
        <Chip
          size="small"
          label={auditStatusLabel(view.status)}
          color={auditStatusColor(view.status)}
        />
      </Box>

      {/* Audit info */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        <KVBox label="Type" value={AUDIT_LABELS[auditType]} />
        <KVBox label="Assigned To" value={view.operatorName} />
        <KVBox label="Created By" value={view.createdByName} />
        <KVBox label="Created On" value={formatDateTime(view.createdAt)} />
        <KVBox label="Source File" value={view.sourceFile} />
        <KVBox label="Total Locations" value={view.totalLocations} />
        <KVBox label={view.itemsLabel} value={view.totalItems} />
        {view.extraFields.map((f) => (
          <KVBox key={f.label} label={f.label} value={f.value} />
        ))}
        {view.downloadedAt && (
          <KVBox
            label="Downloaded On"
            value={formatDateTime(view.downloadedAt)}
          />
        )}
        {view.startedAt && (
          <KVBox label="Started On" value={formatDateTime(view.startedAt)} />
        )}
        {view.submittedAt && (
          <KVBox
            label="Submitted On"
            value={formatDateTime(view.submittedAt)}
          />
        )}
      </Box>

      {awaitingUpload ? (
        /* ASSIGNED / IN PROGRESS: no reconciliation data yet -> only this badge */

        <Paper
          variant="outlined"
          sx={{
            width: "100%",
            p: 2,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "background.paper",
            borderColor: "divider",
          }}
        >
          {/* Status icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 1.5,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
            }}
          >
            <Hourglass size={20} />
          </Box>

          {/* Status message */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700}>
              Awaiting Operator Upload
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.25 }}
            >
              Reconciliation details will be available once the operator
              completes the audit and uploads the results.
            </Typography>
          </Box>

          {/* Pending badge */}
          <Chip
            label="Pending"
            size="small"
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
              color: "text.primary",
              fontWeight: 600,
              flexShrink: 0,
            }}
          />
        </Paper>
      ) : (
        <>
          <ReconDetailStatCards expected={view.totalItems} />

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Hourglass size={22} />
            <Box>
              <Typography fontWeight={700}>
                Reconciliation details are not available yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Discrepancies and the Close Audit / Download Variance Report
                actions appear here once the reconciliation data is available.
              </Typography>
            </Box>
          </Paper>
        </>
      )}

      <AuditExcelPreview
        title="Audit Materials"
        rows={view.rows}
        headers={["Storage", "Material Code", "Expected Qty"]}
      />

      {onDownloadReport && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <CommonButton
            onClick={onDownloadReport}
            disabled={downloading}
            startIcon={downloading ? undefined : <Download size={16} />}
          >
            {downloading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "DOWNLOAD REPORT"
            )}
          </CommonButton>
        </Paper>
      )}
    </Box>
  );
}
