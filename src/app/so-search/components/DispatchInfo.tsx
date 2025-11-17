import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";

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

export default function DispatchInfo({
  dispatchInfo,
  onViewAttachments,
}: Props) {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.1); // Lighter yellow

  return (
    <Paper sx={{ p: 3, mb: 3 }} id="dispatch-section">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">DISPATCH INFO</Typography>
        <Button onClick={onViewAttachments} color="info">
          Attachments
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderColor: "#1F2933" }}
      >
        <Table
          sx={{
            "& .MuiTableCell-root": {
              border: "1px solid #1F2933", // Black border for all cells
            },
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: lightYellow, // Light yellow for odd rows
            },
          }}
        >
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell
                sx={{ color: "primary.contrastText", fontWeight: "bold" }}
              >
                Customer Name
              </TableCell>
              <TableCell
                sx={{ color: "primary.contrastText", fontWeight: "bold" }}
              >
                Address
              </TableCell>
              <TableCell
                sx={{ color: "primary.contrastText", fontWeight: "bold" }}
              >
                Vehicle Number
              </TableCell>
              <TableCell
                sx={{ color: "primary.contrastText", fontWeight: "bold" }}
              >
                Transporter
              </TableCell>
              <TableCell
                sx={{ color: "primary.contrastText", fontWeight: "bold" }}
              >
                Updated By
              </TableCell>
              <TableCell
                sx={{ color: "primary.contrastText", fontWeight: "bold" }}
              >
                Updated Datetime
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dispatchInfo.map((dispatch) => (
              <TableRow key={dispatch.id}>
                <TableCell>
                  {dispatch.customerName || dispatch.customer?.name || "-"}
                </TableCell>
                <TableCell>{dispatch.address}</TableCell>
                <TableCell>{dispatch.vehicleNumber}</TableCell>
                <TableCell>
                  {dispatch.transporterName ||
                    dispatch.transporter?.name ||
                    "-"}
                </TableCell>
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
