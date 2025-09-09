import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useState } from "react";

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
  const [filters, setFilters] = useState({ text: "", batch: "" });

  const filteredMaterials =
    materialDetails.filter((m) => {
      const textMatch =
        !filters.text ||
        m.Material_Code?.toLowerCase().includes(filters.text.toLowerCase()) ||
        m.Material_Description?.toLowerCase().includes(filters.text.toLowerCase());
      const batchMatch =
        !filters.batch ||
        m.Batch_No?.toLowerCase().includes(filters.batch.toLowerCase());
      return textMatch && batchMatch;
    }) || [];

  return (
    <Paper sx={{ p: 3, mb: 3 }} id="material-section">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">MATERIAL DETAILS</Typography>
        <Button onClick={onViewAttachments}>Attachments</Button>
      </Box>
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          size="small"
          label="Search code/description"
          value={filters.text}
          onChange={(e) => setFilters((p) => ({ ...p, text: e.target.value }))}
        />
        <TextField
          size="small"
          label="Batch contains..."
          value={filters.batch}
          onChange={(e) => setFilters((p) => ({ ...p, batch: e.target.value }))}
        />
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
            {filteredMaterials.map((m) => (
              <TableRow key={m.ID}>
                <TableCell>{m.Material_Code}</TableCell>
                <TableCell>{m.Material_Description}</TableCell>
                <TableCell>{m.Batch_No}</TableCell>
                <TableCell>{m.SO_Donor_Batch}</TableCell>
                <TableCell>{m.Cert_No}</TableCell>
                <TableCell>{m.Bin_No}</TableCell>
                <TableCell>{m.A_D_F}</TableCell>
                <TableCell>{m.Required_Qty}</TableCell>
                <TableCell>{m.Issue_stage}</TableCell>
                <TableCell>{m.Packing_stage}</TableCell>
                <TableCell>{m.UpdatedBy}</TableCell>
                <TableCell>
                  {m.UpdatedDate
                    ? new Date(m.UpdatedDate).toLocaleString()
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