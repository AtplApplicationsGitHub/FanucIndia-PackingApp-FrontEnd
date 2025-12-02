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
  const lightYellow = alpha(theme.palette.primary.main, 0.25); // Lighter yellow

  return (
    <Paper sx={{ p: 3, mb: 3 }} id="dispatch-section">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" sx={{ color: 'secondary.main', fontWeight: 600 }}>DISPATCH</Typography>
        <Button 
          onClick={onViewAttachments} 
          variant="contained"
          sx={{
              bgcolor: (theme) => theme.palette.action.hover,
              color: (theme) => theme.palette.text.primary,
              borderRadius: 0,
              clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
              fontWeight: 600,
              fontSize: 15,
              minWidth: 120,
              height: 40,
              px: 3,
              textTransform: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
                "& .MuiSvgIcon-root, & svg": {
                  color: "#000",
                },
              },
            }}
        >
          ATTACHMENTS
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        // variant="outlined"
        // sx={{ borderColor: "#1F2933" }}
      >
        <Table sx={{
          // '& .MuiTableCell-root': {
          //   borderBottom: '1px solid #1F2933', // Black border ONLY on bottom
          // },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': {
            backgroundColor: lightYellow, // Light yellow for odd rows
          },
          // '& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root': {
          //   borderBottom: 0, // Remove border from last row cells
          // },
        }}>
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
