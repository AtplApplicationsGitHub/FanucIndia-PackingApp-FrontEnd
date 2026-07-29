import {
  Box,
  IconButton,
  Link,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { KVBox } from "./KVBox";
import { formatDateIST, formatDateTimeIST } from "@/common/utils/dateTime";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useState } from "react";
import AuditHistoryDialog, {
  type SalesOrderAuditLog,
} from "./AuditHistoryDialog";

interface SalesOrder {
  status: string;
  priority?: string;
  saleOrderNumber: string;
  deliveryDate: string;
  fgLocation?: string | string[] | null;
  transferOrder?: string;
  outboundDelivery?: string;
  paymentClearance?: boolean;
  product?: { name: string };
  customer?: { name: string; address?: string; contactNumber?: string | null };
  customerNameText?: string | null;
  packConfig?: { configName: string };
  transporter?: { name: string };
  plantCode?: string | { code: string };
  salesZone?: { name: string };
  specialRemarks?: string;
  additionalRemarks?: string;
  labelRemarks?: string;
  address?: string | null;
  issueAssignedUser?: { name: string; email?: string } | null;
  packingAssignedUser?: { name: string; email?: string } | null;
  erpImportLogs?: ErpImportLogData[];
  ERPImportLogs?: ErpImportLogData[];
  auditLogs?: SalesOrderAuditLog[] | null;
}

interface DispatchInfoData {
  id: number;
  transporter?: { name: string } | null;
  transporterName?: string;
  vehicleNumber: string;
  LRnumber?: string | null;
  UpdatedBy?: string;
  UpdatedDate?: string;
  vehicleEntry?: {
    id: number;
    attachments?: { fileName: string }[];
  } | null;
}

interface VehicleEntrySummary {
  id: number;
  attachments?: { fileName: string }[];
}

interface ErpImportLogData {
  id: number;
  status: string;
  message: string | null;
  createdAt: string;
}

interface Props {
  salesOrder: SalesOrder;
  dispatchInfo?: DispatchInfoData[];
  erpImportLogs?: ErpImportLogData[];
  onViewPackingAttachments: () => void;
  onViewDispatchAttachments?: () => void;
  onViewVehicleAttachments?: (
    entry: VehicleEntrySummary,
  ) => void | Promise<void>;
  onViewPaymentAttachments?: () => void;
  hasPaymentAttachments?: boolean;
}

export default function OrderSnapshot({
  salesOrder,
  dispatchInfo = [],
  erpImportLogs = [],
  onViewPackingAttachments,
  onViewDispatchAttachments,
  onViewVehicleAttachments,
  onViewPaymentAttachments,
  hasPaymentAttachments = false,
}: Props) {
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);

  const customerName =
    salesOrder.customerNameText?.trim() || salesOrder.customer?.name || "—";

  const customerAddress =
    salesOrder.address?.trim() || salesOrder.customer?.address || "";

  const customerContact = salesOrder.customer?.contactNumber?.trim() || "";

  let customerDisplay = customerName;
  if (customerAddress) {
    customerDisplay += `\n${customerAddress}`;
  }
  if (customerContact) {
    customerDisplay += `\n${customerContact}`;
  }

  const issueUser = salesOrder.issueAssignedUser?.email;
  const packUser = salesOrder.packingAssignedUser?.email;

  let terminalValue = "-";
  if (issueUser && packUser) {
    terminalValue = `Issue: ${issueUser}\nPack: ${packUser}`;
  } else if (issueUser) {
    terminalValue = `Issue: ${issueUser}`;
  } else if (packUser) {
    terminalValue = `Pack: ${packUser}`;
  }

  const allErpLogs = [
    ...(Array.isArray(erpImportLogs) ? erpImportLogs : []),
    ...(Array.isArray(salesOrder.erpImportLogs)
      ? salesOrder.erpImportLogs
      : []),
    ...(Array.isArray(salesOrder.ERPImportLogs)
      ? salesOrder.ERPImportLogs
      : []),
  ];
  const latestLog =
    allErpLogs.length > 0
      ? [...allErpLogs].sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          if (!Number.isNaN(timeA) && !Number.isNaN(timeB)) {
            return timeB - timeA;
          }
          return b.id - a.id;
        })[0]
      : null;
  let erpDateDisplay = "-";
  let erpStatusDisplay = "";
  let erpLogColor = "text.primary";

  if (latestLog) {
    erpDateDisplay = formatDateTimeIST(latestLog.createdAt);

    const rawStatus = latestLog.status || "Unknown";
    const message = latestLog.message ? ` - ${latestLog.message}` : "";
    erpStatusDisplay = `${rawStatus}${message}`;

    const normalizedStatus = rawStatus.trim().toLowerCase();
    if (normalizedStatus === "success") {
      erpLogColor = "success.main";
    } else if (normalizedStatus === "failed") {
      erpLogColor = "error.main";
    } else {
      erpLogColor = "warning.main";
    }
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }} id="snapshot-section">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography
            sx={{ color: "secondary.main", fontWeight: 600, fontSize: "20px" }}
          >
            ORDER
          </Typography>
          <Tooltip title="View audit history">
            <span>
              <IconButton
                size="small"
                color="secondary"
                aria-label="View order audit history"
                onClick={() => setAuditDialogOpen(true)}
              >
                <TimelineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <KVBox label="Sales Order Number" value={salesOrder.saleOrderNumber} />
        <KVBox label="Status" value={salesOrder.status} />
        <KVBox
          label="Delivery Date"
          value={formatDateIST(salesOrder.deliveryDate)}
        />
        <KVBox
          label="FG Location"
          value={
            Array.isArray(salesOrder.fgLocation)
              ? salesOrder.fgLocation.join(", ")
              : salesOrder.fgLocation
          }
        />
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <KVBox label="Transfer Order" value={salesOrder.transferOrder} />
        <KVBox label="Outbound Delivery" value={salesOrder.outboundDelivery} />
        <KVBox label="Payment Status">
          {hasPaymentAttachments ? (
            <Link
              component="button"
              variant="body2"
              onClick={onViewPaymentAttachments}
              underline="none"
              sx={{ fontWeight: 600, cursor: "pointer" }}
            >
              {salesOrder.paymentClearance ? "Yes" : "No"}
            </Link>
          ) : (
            <Typography
              variant="body2"
              component="span"
              sx={{ fontWeight: 600 }}
            >
              {salesOrder.paymentClearance ? "Yes" : "No"}
            </Typography>
          )}
        </KVBox>
        <KVBox label="Packing Attachment">
          <Link
            component="button"
            variant="body2"
            onClick={onViewPackingAttachments}
            underline="none"
          >
            ATTACHMENTS
          </Link>
        </KVBox>
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <KVBox label="Product" value={salesOrder.product?.name} />

        <KVBox
          label="Customer"
          value={customerDisplay}
          valueSx={{
            fontSize: "0.85rem",
            lineHeight: 1.25,
            fontWeight: 600,
            whiteSpace: "pre-wrap",
          }}
        />

        <KVBox label="Priority" value={salesOrder.priority} />
        <KVBox label="Terminal" value={terminalValue} />
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <KVBox
          label="Packing Config"
          value={salesOrder.packConfig?.configName}
        />
        <KVBox label="Transporter" value={salesOrder.transporter?.name} />
        <KVBox
          label="Delivery Plant Code"
          value={
            typeof salesOrder.plantCode === "object"
              ? salesOrder.plantCode?.code
              : salesOrder.plantCode
          }
        />
        <KVBox label="Sales Zone" value={salesOrder.salesZone?.name} />
      </Box>

      {/* Special & Additional Remarks */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <KVBox label="Special Remarks" value={salesOrder.specialRemarks} />
        <KVBox
          label="Additional Remarks"
          value={salesOrder.additionalRemarks}
        />
        <KVBox label="Label Remarks" value={salesOrder.labelRemarks} />
        <KVBox label="ERP Import Log">
          {latestLog ? (
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography
                component="span"
                sx={{
                  fontSize: "0.85rem",
                  color: "text.primary",
                  fontWeight: 600,
                }}
              >
                {erpDateDisplay}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: "0.85rem",
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap",
                  color: erpLogColor,
                  fontWeight: 600,
                }}
              >
                {erpStatusDisplay}
              </Typography>
            </Box>
          ) : (
            <Typography
              component="span"
              sx={{
                fontSize: "0.85rem",
                color: "text.primary",
                fontWeight: 600,
              }}
            >
              -
            </Typography>
          )}
        </KVBox>
      </Box>

      {/* Dispatch Info Section */}
      {dispatchInfo.length > 0 && (
        <Box mt={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              sx={{
                color: "secondary.main",
                fontWeight: 600,
                fontSize: "20px",
              }}
            >
              {" "}
              DISPATCH
            </Typography>
            {onViewDispatchAttachments && (
              <Link
                component="button"
                variant="body2"
                onClick={onViewDispatchAttachments}
                underline="none"
                sx={{ fontWeight: 600 }}
              >
                ATTACHMENTS
              </Link>
            )}
          </Box>
          {dispatchInfo.map((dispatch) => (
            <Box
              key={dispatch.id}
              display="flex"
              flexWrap="wrap"
              gap={2}
              mb={2}
            >
              <KVBox label="Vehicle Number">
                {dispatch.vehicleEntry ? (
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() =>
                      onViewVehicleAttachments?.(dispatch.vehicleEntry!)
                    }
                    underline="none"
                    sx={{
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {dispatch.vehicleNumber || "-"}
                  </Link>
                ) : (
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ fontWeight: 600 }}
                  >
                    {dispatch.vehicleNumber || "-"}
                  </Typography>
                )}
              </KVBox>
              <KVBox
                label="Transporter"
                value={
                  dispatch.transporterName || dispatch.transporter?.name || "-"
                }
              />
              <KVBox label="LR Number" value={dispatch.LRnumber || "-"} />
              <KVBox
                label="Updated By / Datetime"
                value={`${dispatch.UpdatedBy || "-"} / ${formatDateTimeIST(dispatch.UpdatedDate)}`}
              />
            </Box>
          ))}
        </Box>
      )}

      <AuditHistoryDialog
        open={auditDialogOpen}
        onClose={() => setAuditDialogOpen(false)}
        auditLogs={salesOrder.auditLogs}
        orderNumber={salesOrder.saleOrderNumber}
        outboundDelivery={salesOrder.outboundDelivery}
      />
    </Paper>
  );
}
