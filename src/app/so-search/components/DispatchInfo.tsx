import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

interface DispatchInfoData {
  id: number;
  customer: { name: string; address: string } | null;
  customerName?: string;
  transporter?: { name: string } | null;
  transporterName?: string;
  vehicleNumber: string;
  UpdatedBy?: string;
  UpdatedDate?: string;
  address: string;
}

interface Props {
  dispatchInfo: DispatchInfoData[];
  onViewAttachments: () => void;
}

export default function DispatchInfo({ dispatchInfo, onViewAttachments }: Props) {
  return (
    <Paper sx={{ p: 3, mb: 3 }} id="dispatch-section">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">DISPATCH INFO</Typography>
        <Button onClick={onViewAttachments}>Attachments</Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Vehicle Number</TableCell>
              <TableCell>Transporter</TableCell>
              <TableCell>Updated By</TableCell>
              <TableCell>Updated Datetime</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dispatchInfo.map((dispatch) => (
              <TableRow key={dispatch.id}>
                <TableCell>{dispatch.customerName || dispatch.customer?.name || "-"}</TableCell>
                <TableCell>{dispatch.address}</TableCell>
                <TableCell>{dispatch.vehicleNumber}</TableCell>
                <TableCell>{dispatch.transporterName || dispatch.transporter?.name || "-"}</TableCell>
                <TableCell>{dispatch.UpdatedBy || "-"}</TableCell>
                <TableCell>
                  {dispatch.UpdatedDate
                    ? new Date(dispatch.UpdatedDate).toLocaleString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}