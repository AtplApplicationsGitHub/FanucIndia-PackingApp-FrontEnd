"use client";

import type { ReactNode } from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import HistoryIcon from "@mui/icons-material/History";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { formatDateTimeIST } from "@/common/utils/dateTime";

export interface AuditChange {
  field: string;
  oldValue?: unknown;
  newValue?: unknown;
  oldDisplayValue?: unknown;
  newDisplayValue?: unknown;
}

export interface SalesOrderAuditLog {
  serialNumber: number;
  action:
    | "ORDER_CREATED"
    | "ORDER_UPDATED"
    | "ORDER_ARCHIVED"
    | "ATTACHMENT_UPLOADED"
    | string;
  description?: string;
  orderReference?: {
    saleOrderNumber?: string | null;
    outboundDelivery?: string | null;
  };
  changes?: AuditChange[];
  files?: string[];
  createdBy?: string | null;
  createdAt?: string | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
  archivedBy?: string | null;
  archivedAt?: string | null;
  uploadedBy?: string | null;
  uploadedAt?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  auditLogs?: SalesOrderAuditLog[] | null;
  orderNumber: string;
  outboundDelivery?: string;
}

const FIELD_LABELS: Record<string, string> = {
  saleOrderNumber: "Sales Order Number",
  outboundDelivery: "Outbound Delivery",
  deliveryDate: "Delivery Date",
  transporterId: "Transporter",
  paymentClearance: "Payment Status",
  transferOrder: "Transfer Order",
  fgLocation: "FG Location",
  customerNameText: "Customer Name",
  additionalRemarks: "Additional Remarks",
  specialRemarks: "Special Remarks",
  labelRemarks: "Label Remarks",
  packConfigId: "Packing Configuration",
  productId: "Product",
  customerId: "Customer",
  salesZoneId: "Sales Zone",
  plantCodeId: "Delivery Plant Code",
  issueAssignedUserId: "Issue Assigned User",
  packingAssignedUserId: "Packing Assigned User",
  skipIssueStage: "Skip Issue Stage",
  skipPackingStage: "Skip Packing Stage",
};

function toReadableLabel(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];

  return field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    return value.length ? value.map(formatAuditValue).join(", ") : "—";
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getActor(log: SalesOrderAuditLog): string {
  return (
    log.updatedBy || log.createdBy || log.archivedBy || log.uploadedBy || "SYSTEM"
  );
}

function getTimestamp(log: SalesOrderAuditLog): string | null {
  return log.updatedAt || log.createdAt || log.archivedAt || log.uploadedAt || null;
}

function getActionDetails(action: string) {
  switch (action) {
    case "ORDER_CREATED":
      return {
        label: "Order Created",
        color: "success" as const,
        icon: <AddCircleOutlineIcon fontSize="small" />,
      };
    case "ORDER_ARCHIVED":
      return {
        label: "Order Archived",
        color: "warning" as const,
        icon: <ArchiveOutlinedIcon fontSize="small" />,
      };
    case "ORDER_UPDATED":
      return {
        label: "Order Updated",
        color: "primary" as const,
        icon: <EditNoteIcon fontSize="small" />,
      };
    case "ATTACHMENT_UPLOADED":
      return {
        label: "Attachments Uploaded",
        color: "info" as const,
        icon: <AttachFileIcon fontSize="small" />,
      };
    default:
      return {
        label: action.replace(/_/g, " "),
        color: "default" as const,
        icon: <HistoryIcon fontSize="small" />,
      };
  }
}

/** KPI style summary card - matches the KPI card language used across the dashboards */
function SummaryKpiCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  accent: "info" | "success";
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          bgcolor: (theme) =>
            alpha(
              accent === "info"
                ? theme.palette.info.main
                : theme.palette.success.main,
              0.14,
            ),
          color: `${accent}.main`,
        }}
      >
        {icon}
      </Box>
      <Box minWidth={0}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.4 }}
        >
          {label}
        </Typography>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          noWrap
          title={value || "—"}
        >
          {value || "—"}
        </Typography>
      </Box>
    </Paper>
  );
}

/** Shared table shell to match the design of the other Dialog tables on the SO Search page */
function AuditTable({
  headers,
  columnWidths,
  children,
}: {
  headers: string[];
  columnWidths?: string[];
  children: ReactNode;
}) {
  const theme = useTheme();
  const lightYellow = alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.1 : 0.25,
  );

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table
        size="small"
        sx={{
          tableLayout: "fixed",
          width: "100%",
          "& .MuiTableCell-root": {
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            verticalAlign: "top",
          },
          "& .MuiTableCell-root:nth-last-of-type(-n+2)": {
            whiteSpace: "nowrap",
          },
          "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
            backgroundColor: lightYellow,
          },
          "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root":
            {
              borderBottom: 0,
            },
        }}
      >
        <TableHead sx={{ bgcolor: "primary.main" }}>
          <TableRow>
            {headers.map((header, i) => (
              <TableCell
                key={header}
                sx={{
                  color: "primary.contrastText",
                  fontWeight: "bold",
                  width: columnWidths?.[i],
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  );
}

function AuditLogEntry({
  log,
  isLatest,
  orderNumber,
  outboundDelivery,
}: {
  log: SalesOrderAuditLog;
  isLatest: boolean;
  orderNumber: string;
  outboundDelivery?: string;
}) {
  const action = getActionDetails(log.action);
  const changes = Array.isArray(log.changes) ? log.changes : [];
  const actor = getActor(log);
  const timestamp = getTimestamp(log);

  const isUpdate = log.action === "ORDER_UPDATED" && changes.length > 0;

  const chipLabel = isUpdate
    ? `#${log.serialNumber} ${changes.map((c) => toReadableLabel(c.field)).join(", ")} Updated`
    : `#${log.serialNumber} ${action.label}`;

  const soNumber =
    log.orderReference?.saleOrderNumber || orderNumber || "—";
  const obdValue =
    log.orderReference?.outboundDelivery || outboundDelivery || "—";

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          px: 1.5,
          py: 1,
          bgcolor: "action.hover",
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            color={action.color}
            icon={action.icon}
            label={chipLabel}
            sx={{ fontWeight: 700, height: 26 }}
          />
          {isLatest && (
            <Chip
              size="small"
              variant="outlined"
              color="secondary"
              label="Latest"
              sx={{ height: 26 }}
            />
          )}
        </Stack>
      </Box>

      <Box sx={{ p: 1.5 }}>
        {isUpdate ? (
          <AuditTable
            headers={[
              "Order Data",
              "Previous Data",
              "New Data",
              "Updated By",
              "Updated At",
            ]}
            columnWidths={["17%", "23%", "23%", "17%", "20%"]}
          >
            {changes.map((change, changeIndex) => {
              const oldValue = change.oldDisplayValue ?? change.oldValue;
              const newValue = change.newDisplayValue ?? change.newValue;

              return (
                <TableRow key={`${change.field}-${changeIndex}`}>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {toReadableLabel(change.field)}
                  </TableCell>
                  <TableCell sx={{ wordBreak: "break-word" }}>
                    {formatAuditValue(oldValue)}
                  </TableCell>
                  <TableCell sx={{ wordBreak: "break-word", fontWeight: 700 }}>
                    {formatAuditValue(newValue)}
                  </TableCell>
                  <TableCell>{actor}</TableCell>
                  <TableCell>
                    {timestamp ? formatDateTimeIST(timestamp) : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </AuditTable>
        ) : log.action === "ORDER_CREATED" ? (
          <AuditTable
            headers={["SO Number", "OBD Value", "Created By", "Created At"]}
            columnWidths={["25%", "25%", "24%", "26%"]}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{soNumber}</TableCell>
              <TableCell>{obdValue}</TableCell>
              <TableCell>{actor}</TableCell>
              <TableCell>
                {timestamp ? formatDateTimeIST(timestamp) : "—"}
              </TableCell>
            </TableRow>
          </AuditTable>
        ) : log.action === "ORDER_ARCHIVED" ? (
          <AuditTable
            headers={["SO Number", "OBD Value", "Archived By", "Archived At"]}
            columnWidths={["25%", "25%", "24%", "26%"]}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{soNumber}</TableCell>
              <TableCell>{obdValue}</TableCell>
              <TableCell>{actor}</TableCell>
              <TableCell>
                {timestamp ? formatDateTimeIST(timestamp) : "—"}
              </TableCell>
            </TableRow>
          </AuditTable>
        ) : log.action === "ATTACHMENT_UPLOADED" ? (
          <AuditTable
            headers={[
              "SO Number",
              "OBD Value",
              "Files",
              "Uploaded By",
              "Uploaded At",
            ]}
            columnWidths={["16%", "16%", "34%", "16%", "18%"]}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{soNumber}</TableCell>
              <TableCell>{obdValue}</TableCell>
              <TableCell sx={{ wordBreak: "break-word" }}>
                {formatAuditValue(log.files)}
              </TableCell>
              <TableCell>{actor}</TableCell>
              <TableCell>
                {timestamp ? formatDateTimeIST(timestamp) : "—"}
              </TableCell>
            </TableRow>
          </AuditTable>
        ) : (
          <AuditTable
            headers={["SO Number", "OBD Value", "By", "At"]}
            columnWidths={["25%", "25%", "24%", "26%"]}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{soNumber}</TableCell>
              <TableCell>{obdValue}</TableCell>
              <TableCell>{actor}</TableCell>
              <TableCell>
                {timestamp ? formatDateTimeIST(timestamp) : "—"}
              </TableCell>
            </TableRow>
          </AuditTable>
        )}
      </Box>
    </Paper>
  );
}

export default function AuditHistoryDialog({
  open,
  onClose,
  auditLogs = [],
  orderNumber,
  outboundDelivery,
}: Props) {
  const sortedLogs = [...(Array.isArray(auditLogs) ? auditLogs : [])].sort(
    (a, b) => {
      const serialDifference =
        Number(b.serialNumber || 0) - Number(a.serialNumber || 0);
      if (serialDifference !== 0) return serialDifference;

      const bTime = new Date(getTimestamp(b) || 0).getTime();
      const aTime = new Date(getTimestamp(a) || 0).getTime();
      return bTime - aTime;
    },
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: 0.4,
          color: "secondary.main",
          py: 1.5,
          position: "relative",
        }}
      >
        AUDIT HISTORY
        <IconButton
          onClick={onClose}
          aria-label="Close audit history"
          size="small"
          sx={{ position: "absolute", right: 14 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          height: { xs: "72vh", md: "65vh" },
          maxHeight: "65vh",
          overflowY: "auto",
          px: { xs: 2, sm: 3 },
          py: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <SummaryKpiCard
            icon={<ReceiptLongIcon />}
            label="Sale Order Number"
            value={orderNumber}
            accent="info"
          />
          <SummaryKpiCard
            icon={<LocalShippingIcon />}
            label="Outbound Delivery"
            value={outboundDelivery}
            accent="success"
          />
        </Stack>

        {sortedLogs.length === 0 ? (
          <Box
            minHeight={220}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={1}
          >
            <HistoryIcon color="disabled" sx={{ fontSize: 42 }} />
            <Typography color="text.secondary">
              No audit history is available for this order.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {sortedLogs.map((log, index) => (
              <AuditLogEntry
                key={`${log.serialNumber}-${log.action}-${index}`}
                log={log}
                isLatest={index === 0}
                orderNumber={orderNumber}
                outboundDelivery={outboundDelivery}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}