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
  Link,
} from "@mui/material";
import { formatDateTimeIST } from "@/common/utils/dateTime";

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
  dispatchInfo: DispatchInfoData[];
  onViewAttachments: () => void;
  onViewVehicleAttachments: (entry: VehicleEntrySummary) => void;
}

export default function DispatchInfo({
  dispatchInfo,
  onViewAttachments,
  onViewVehicleAttachments,
}: Props) {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  return (
    <Paper sx={{ p: 3, mb: 3 }} id="dispatch-section">
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
          DISPATCH
        </Typography>
        <Button
          onClick={onViewAttachments}
          variant="contained"
          sx={{
            bgcolor: (theme) => theme.palette.action.hover,
            color: (theme) => theme.palette.text.primary,
            borderRadius: 0,
            clipPath:
              "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
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
      <TableContainer component={Paper}>
        <Table
          sx={{
            tableLayout: "fixed",
            width: "100%",
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: lightYellow,
            },
          }}
        >
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell
                sx={{ 
                  color: "primary.contrastText", 
                  fontWeight: "bold", 
                  width: "40%" 
                }}
              >
                Vehicle Number
              </TableCell>
              <TableCell
                sx={{ 
                  color: "primary.contrastText", 
                  fontWeight: "bold", 
                  width: "40%" 
                }}
              >
                Transporter
              </TableCell>
              <TableCell
                sx={{ 
                  color: "primary.contrastText", 
                  fontWeight: "bold", 
                  width: "40%" 
                }}
              >
                Updated By
              </TableCell>
              <TableCell
                sx={{ 
                  color: "primary.contrastText", 
                  fontWeight: "bold", 
                  width: "40%" 
                }}
              >
                Updated Datetime
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dispatchInfo.map((dispatch) => (
              <TableRow key={dispatch.id}>
                <TableCell>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (dispatch.vehicleEntry) {
                        onViewVehicleAttachments(dispatch.vehicleEntry);
                      }
                    }}
                    sx={{
                      fontWeight: "bold",
                      textDecoration: "none",
                      cursor: dispatch.vehicleEntry ? "pointer" : "default",
                      color: dispatch.vehicleEntry ? "#1976d2" : "text.primary",
                      textAlign: "left",
                      fontSize: "inherit",
                      verticalAlign: "baseline",
                      border: "none",
                      background: "none",
                      p: 0,
                    }}
                  >
                    {dispatch.vehicleNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  {dispatch.transporterName || dispatch.transporter?.name || "-"}
                </TableCell>
                <TableCell>{dispatch.UpdatedBy || "-"}</TableCell>
                <TableCell>
                  {dispatch.UpdatedDate
                    ? formatDateTimeIST(dispatch.UpdatedDate)
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