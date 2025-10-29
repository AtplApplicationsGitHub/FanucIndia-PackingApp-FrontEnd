import { Box, Chip, Link, Paper, Typography } from "@mui/material";
import { KVBox } from "./KVBox";
import OrderStatusStepper from "./OrderStatusStepper";

// Define a minimal type for the salesOrder prop
interface SalesOrder {
  status: string;
  priority?: string;
  saleOrderNumber: string;
  deliveryDate: string;
  fgLocation?: string;
  transferOrder?: string;
  outboundDelivery?: string;
  paymentClearance?: boolean;
  product?: { name: string };
  customer?: { name: string };
  packConfig?: { configName: string };
  transporter?: { name: string };
  plantCode?: { code: string };
  salesZone?: { name: string };
  specialRemarks?: string;
}

interface Props {
  salesOrder: SalesOrder;
  onViewPackingAttachments: () => void;
}

export default function OrderSnapshot({ salesOrder, onViewPackingAttachments }: Props) {
  return (
    <Paper sx={{ p: 3, mb: 3 }} id="snapshot-section">
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <KVBox label="SO" value={salesOrder.saleOrderNumber} />
        <KVBox label="Status" value={salesOrder.status} />
        <KVBox
          label="Delivery Date"
          value={new Date(salesOrder.deliveryDate).toLocaleDateString()}
        />
        <KVBox label="FG Location" value={salesOrder.fgLocation} />
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <KVBox label="TO" value={salesOrder.transferOrder} />
        <KVBox label="OB" value={salesOrder.outboundDelivery} />
        <KVBox
          label="Payment Status"
          value={salesOrder.paymentClearance ? "Yes" : "No"}
        />
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
          value={salesOrder.customer?.name}
        />
        <KVBox label="Priority" value={salesOrder.priority} />
        <KVBox label="Terminal" value={"-"} />
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2}>
        <KVBox
          label="Packing Config"
          value={salesOrder.packConfig?.configName}
        />
        <KVBox
          label="Transporter"
          value={salesOrder.transporter?.name}
        />
        <KVBox
          label="Delivery Plant Code"
          value={salesOrder.plantCode?.code}
        />
        <KVBox
          label="Sales Zone"
          value={salesOrder.salesZone?.name}
        />
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
        <KVBox
          label="Special Remarks"
          value={salesOrder.specialRemarks}
          fullWidth
        />
      </Box>
    </Paper>
  );
}