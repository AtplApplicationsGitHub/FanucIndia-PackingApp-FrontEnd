import { Box, Link, Paper, Typography } from "@mui/material";
import { KVBox } from "./KVBox";

// Define a minimal type for the salesOrder prop
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
  customer?: { name: string; address?: string; contactNumber?: string | null; };
  customerNameText?: string | null;
  packConfig?: { configName: string };
  transporter?: { name: string };
  plantCode?: string | { code: string };
  salesZone?: { name: string };
  specialRemarks?: string;
  additionalRemarks?: string;
  labelRemarks?: string;
  address?: string | null;
}

interface DispatchInfoData {
  id: number;
  transporter?: { name: string } | null;
  transporterName?: string;
  vehicleNumber: string;
  UpdatedBy?: string;
  UpdatedDate?: string;
  vehicleEntry?: {
    id: number;
    attachments: { fileName: string }[];
  } | null;
}

interface VehicleEntrySummary {
  id: number;
  attachments: { fileName: string }[];
}

interface Props {
  salesOrder: SalesOrder;
  dispatchInfo?: DispatchInfoData[];
  onViewPackingAttachments: () => void;
  onViewDispatchAttachments?: () => void;
  onViewVehicleAttachments?: (entry: VehicleEntrySummary) => void;
  onViewPaymentAttachments?: () => void;
  hasPaymentAttachments?: boolean;
}

export default function OrderSnapshot({
  salesOrder,
  dispatchInfo = [],
  onViewPackingAttachments,
  onViewDispatchAttachments,
  onViewVehicleAttachments,
  onViewPaymentAttachments,
  hasPaymentAttachments = false,
}: Props) {
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

  return (
    <Paper sx={{ p: 3, mb: 3 }} id="snapshot-section">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          sx={{ color: "secondary.main", fontWeight: 600, fontSize: "20px" }}
        >
          ORDER
        </Typography>
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <KVBox label="Sales Order Number" value={salesOrder.saleOrderNumber} />
        <KVBox label="Status" value={salesOrder.status} />
        <KVBox
          label="Delivery Date"
          value={new Date(salesOrder.deliveryDate).toLocaleDateString()}
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
            <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
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
            whiteSpace: "pre-wrap"
          }}
        />

        <KVBox label="Priority" value={salesOrder.priority} />
        <KVBox label="Terminal" value={"-"} />
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <KVBox
          label="Packing Config"
          value={salesOrder.packConfig?.configName}
        />
        <KVBox label="Transporter" value={salesOrder.transporter?.name} />
        <KVBox
          label="Delivery Plant Code"
          value={typeof salesOrder.plantCode === 'object' ? salesOrder.plantCode?.code : salesOrder.plantCode}
        />
        <KVBox label="Sales Zone" value={salesOrder.salesZone?.name} />
      </Box>

      {/* Special & Additional Remarks */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <KVBox
          label="Special Remarks"
          value={salesOrder.specialRemarks}
        />
        <KVBox
          label="Additional Remarks"
          value={salesOrder.additionalRemarks}
        />
        <KVBox
          label="Label Remarks"
          value={salesOrder.labelRemarks}
        />
        <Box sx={{ flex: "1 1 23%", minWidth: "200px" }} />
      </Box>

      {/* Dispatch Info Section */}
      {dispatchInfo.length > 0 && (
        <Box mt={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography
              sx={{ color: "secondary.main", fontWeight: 600, fontSize: "20px" }}
            >              DISPATCH
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
            <Box key={dispatch.id} display="flex" flexWrap="wrap" gap={2} mb={2}>
              <KVBox label="Vehicle Number">
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => dispatch.vehicleEntry && onViewVehicleAttachments?.(dispatch.vehicleEntry)}
                  sx={{
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: dispatch.vehicleEntry ? '' : '',
                    cursor: dispatch.vehicleEntry ? 'pointer' : 'default'
                  }}
                >
                  {dispatch.vehicleNumber}
                </Link>
              </KVBox>
              <KVBox
                label="Transporter"
                value={dispatch.transporterName || dispatch.transporter?.name || "-"}
              />
              <KVBox label="Updated By" value={dispatch.UpdatedBy || "-"} />
              <KVBox
                label="Updated Datetime"
                value={dispatch.UpdatedDate ? new Date(dispatch.UpdatedDate).toLocaleString() : "-"}
              />
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
