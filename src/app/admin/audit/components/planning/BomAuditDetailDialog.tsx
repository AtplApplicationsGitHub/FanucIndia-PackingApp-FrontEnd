"use client";

import { useMemo } from "react";

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
} from "@mui/material";
import { X } from "lucide-react";

import { KVBox } from "@/app/so-search/components/KVBox";
import AuditExcelPreview from "./AuditExcelPreview";
import { useBomAuditDetail } from "../../hooks/useBomAuditDetail";
import { AUDIT_LABELS } from "../../utils/auditLabels";
import {
  bomAuditStatusColor,
  bomAuditStatusLabel,
} from "../../utils/bomAuditStatus";

import type { AuditRow } from "../../types/audit";

type Props = {
  auditId: number | null;
  onClose: () => void;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export default function BomAuditDetailDialog({ auditId, onClose }: Props) {
  const { detail, loading, error } = useBomAuditDetail(auditId);

  const rows = useMemo<AuditRow[]>(
    () =>
      detail
        ? detail.locations.flatMap((location) =>
            location.materials.map((material) => ({
              storage: location.storageBin,
              materialCode: material.materialCode,
              quantity: material.expectedQty,
              excelRow: material.id,
            })),
          )
        : [],
    [detail],
  );

  return (
    <Dialog
      open={auditId !== null}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 700,
          fontSize: "20px",
          letterSpacing: 0.5,
          color: "error.main",
          pb: 1,
          position: "relative",
        }}
      >
        {AUDIT_LABELS.bom.toUpperCase()} – AUDIT DETAILS
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 12 }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 0.5 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2, whiteSpace: "pre-line" }}>
            {error}
          </Alert>
        )}

        {detail && (
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 3 }}>
              <KVBox label="Audit No" value={detail.auditNo} />
              <KVBox label="Audit Name" value={detail.auditName} />
              <KVBox label="Type" value={AUDIT_LABELS.bom} />
              <KVBox label="Status">
                <Chip
                  label={bomAuditStatusLabel(detail.status)}
                  size="small"
                  color={bomAuditStatusColor(detail.status)}
                />
              </KVBox>
              <KVBox label="Assigned To" value={detail.operatorName} />
              <KVBox label="Created By" value={detail.createdByName} />
              <KVBox
                label="Created On"
                value={formatDateTime(detail.createdAt)}
              />
              <KVBox label="Source File" value={detail.fileName} />
              <KVBox label="Total Locations" value={detail.totalLocations} />
              <KVBox label="Total Materials" value={detail.totalMaterials} />
              {detail.cancelledAt && (
                <>
                  <KVBox
                    label="Cancelled On"
                    value={formatDateTime(detail.cancelledAt)}
                  />
                  <KVBox label="Cancelled By" value={detail.cancelledByName} />
                </>
              )}
              {detail.downloadedAt && (
                <KVBox label="Downloaded On" value={formatDateTime(detail.downloadedAt)} />
              )}
              {detail.startedAt && (
                <KVBox label="Started On" value={formatDateTime(detail.startedAt)} />
              )}
              {detail.submittedAt && (
                <KVBox label="Submitted On" value={formatDateTime(detail.submittedAt)} />
              )}
            </Box>

            <AuditExcelPreview
              title="Audit Materials"
              rows={rows}
              headers={["Storage", "Material Code", "Expected Qty"]}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
