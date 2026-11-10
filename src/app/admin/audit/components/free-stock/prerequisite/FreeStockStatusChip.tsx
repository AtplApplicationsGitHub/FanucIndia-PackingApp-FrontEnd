import { Chip } from "@mui/material";
import type { FreeStockStatus } from "../../../types/freeStock";
export default function FreeStockStatusChip({ status }: { status: FreeStockStatus }) {
  return <Chip size="small" label={{ OPEN: "Open", RESERVED: "Reserved", CLOSED: "Closed" }[status]} color={status === "OPEN" ? "success" : status === "RESERVED" ? "warning" : "default"} sx={{ fontWeight: 600 }} />;
}
