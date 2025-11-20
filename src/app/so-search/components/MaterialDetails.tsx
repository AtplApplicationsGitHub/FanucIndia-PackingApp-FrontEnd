import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme, alpha } from "@mui/material";

interface MaterialDetail {
  ID: number;
  Material_Code: string;
  Material_Description: string;
  Batch_No: string;
  SO_Donor_Batch?: string;
  Cert_No?: string;
  Bin_No?: string;
  A_D_F?: string;
  Required_Qty: number;
  Issue_stage: number;
  Packing_stage: number;
  UpdatedBy?: string;
  UpdatedDate?: string;
}

interface Props {
  materialDetails: MaterialDetail[];
  onViewAttachments: () => void;
}

export default function MaterialDetails({ materialDetails, onViewAttachments }: Props) {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.1); // Lighter yellow
  const displayMaterials = materialDetails || [];

  return (
    <Paper sx={{ p: 3, mb: 3 }} id="material-section">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" sx={{ color: 'secondary.main', fontWeight: 600 }}>MATERIALS</Typography>
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

      <TableContainer component={Paper} 
      // variant="outlined" sx={{ borderColor: '#1F2933' }}
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
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Material Code</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Batch</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>SO Donor</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Cert No</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Bin</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>A/D/F</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Req Qty</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Issue</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Packing</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Updated By</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Updated Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayMaterials.map((m) => (
              <TableRow key={m.ID}>
                <TableCell>{m.Material_Code}</TableCell>
                <TableCell>{m.Material_Description}</TableCell>
                <TableCell>{m.Batch_No}</TableCell>
                <TableCell>{m.SO_Donor_Batch || "-"}</TableCell> 
                <TableCell>{m.Cert_No || "-"}</TableCell>
                <TableCell>{m.Bin_No || "-"}</TableCell>
                <TableCell>{m.A_D_F || "-"}</TableCell>
                <TableCell>{m.Required_Qty}</TableCell>
                <TableCell>{m.Issue_stage}</TableCell>
                <TableCell>{m.Packing_stage}</TableCell>
                <TableCell>{m.UpdatedBy || "-"}</TableCell>
                <TableCell>
                  {m.UpdatedDate
                    ? new Date(m.UpdatedDate).toLocaleString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
             {displayMaterials.length === 0 && (
                <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No material details found for this order.</Typography>
                    </TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}