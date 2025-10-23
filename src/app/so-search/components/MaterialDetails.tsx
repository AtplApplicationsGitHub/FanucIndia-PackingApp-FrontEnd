import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

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
  const displayMaterials = materialDetails || [];

  return (
    <Paper sx={{ p: 3, mb: 3 }} id="material-section">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">MATERIAL DETAILS</Typography>
        <Button onClick={onViewAttachments}>Attachments</Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Material Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>SO Donor</TableCell>
              <TableCell>Cert No</TableCell>
              <TableCell>Bin</TableCell>
              <TableCell>A/D/F</TableCell>
              <TableCell>Req Qty</TableCell>
              <TableCell>Issue</TableCell>
              <TableCell>Packing</TableCell>
              <TableCell>Updated By</TableCell>
              <TableCell>Updated Date</TableCell>
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