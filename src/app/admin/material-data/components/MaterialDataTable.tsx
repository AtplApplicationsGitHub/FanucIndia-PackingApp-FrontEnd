"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import type { MaterialRow } from "../types/material-row";

interface Props {
  rows: MaterialRow[];
  loading?: boolean;
  onUpdateIssueStage?: (
    materialCode: string,
    issueStage: number
  ) => Promise<MaterialRow | null>;
  onProcessRowUpdateError?: (error: any) => void;
}

const columns: GridColDef[] = [
  { field: "siNo", headerName: "S. No.", width: 80 },
  { field: "materialCode", headerName: "Material Code", width: 170 },
  {
    field: "materialDescription",
    headerName: "Description",
    flex: 1,
    minWidth: 200,
  },
  { field: "batchNo", headerName: "Batch No", width: 120 },
  { field: "soDonorBatch", headerName: "SO Donor Batch", width: 140 },
  { field: "certNo", headerName: "Cert No", width: 130 },
  { field: "binNo", headerName: "Bin No", width: 120 },
  { field: "adf", headerName: "A/D/F", width: 120 },
  {
    field: "reqQuantity",
    headerName: "Required Qty",
    type: "number",
    width: 120,
  },
  {
    field: "issueStage",
    headerName: "Issue Stage",
    type: "number",
    width: 120,
    editable: true,
  },
];

export default function MaterialDataTable({
  rows,
  loading = false,
  onUpdateIssueStage,
  onProcessRowUpdateError,
}: Props) {
  // processRowUpdate now calls the backend and returns the updated row
  const processRowUpdate = async (newRow: MaterialRow, oldRow: MaterialRow) => {
    if (newRow.issueStage > newRow.reqQuantity || newRow.issueStage < 0) {
      throw new Error("Issue Stage must be between 0 and Required Qty");
    }
    if (onUpdateIssueStage) {
      const updatedRow = await onUpdateIssueStage(
        newRow.materialCode,
        newRow.issueStage
      );
      if (!updatedRow) throw new Error("Failed to update Issue Stage");
      return updatedRow;
    }
    return oldRow;
  };

  return (
    <div style={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 50, 100]}
        autoHeight
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={onProcessRowUpdateError || ((error) => console.error(error))}
      />
    </div>
  );
}
