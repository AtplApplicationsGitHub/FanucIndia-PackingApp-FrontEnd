import { Box, Link, Paper, Typography } from "@mui/material";
import { KVBox } from "./KVBox";

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
  customer?: { name: string; address?: string };
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

interface Props {
  salesOrder: SalesOrder;
  onViewPackingAttachments: () => void;
}

export default function OrderSnapshot({
  salesOrder,
  onViewPackingAttachments,
}: Props) {
  const customerName =
    salesOrder.customerNameText?.trim() || salesOrder.customer?.name || "—";

  const customerAddress =
    salesOrder.address?.trim() || salesOrder.customer?.address || "";

  const customerDisplay = customerAddress
    ? `${customerName}\n${customerAddress}`
    : customerName;

  return (
    <Paper sx={{ p: 3, mb: 3 }} id="snapshot-section">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h5"
          sx={{ color: "secondary.main", fontWeight: 600 }}
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
        <KVBox label="FG Location" value={salesOrder.fgLocation} />
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <KVBox label="Transfer Order" value={salesOrder.transferOrder} />
        <KVBox label="Outbound Delivery" value={salesOrder.outboundDelivery} />
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
          value={customerDisplay}
          valueSx={{
            fontSize: "0.85rem", 
            lineHeight: 1.25,
            fontWeight: 600,
          }}
        />

        <KVBox label="Priority" value={salesOrder.priority} />
        <KVBox label="Terminal" value={"-"} />
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2}>
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
      <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
        <KVBox
          label="Special Remarks"
          value={salesOrder.specialRemarks}
          fullWidth
        />
        <KVBox
          label="Additional Remarks"
          value={salesOrder.additionalRemarks}
          fullWidth
        />
        <KVBox
          label="Label Remarks"
          value={salesOrder.labelRemarks} 
          fullWidth 
        />
      </Box>
    </Paper>
  );
}
