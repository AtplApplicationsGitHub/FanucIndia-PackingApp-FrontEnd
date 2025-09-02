"use client";

import { DataGrid, GridColDef, GridRowClassNameParams } from "@mui/x-data-grid";
import type { MaterialRow } from "@/app/admin/material-data/types/material-row";
import { alpha } from "@mui/material/styles";

interface Props {
  rows: MaterialRow[];
  loading?: boolean;
  onUpdateIssueStage?: (
    materialCode: string,
    value: number
  ) => Promise<MaterialRow | null>;
  onUpdatePackingStage?: (
    materialCode: string,
    value: number
  ) => Promise<MaterialRow | null>;
  onProcessRowUpdateError?: (error: Error) => void;
  isOrderFullyComplete?: boolean;
}

export default function MaterialDataTable({
  rows,
  loading,
  onUpdateIssueStage,
  onUpdatePackingStage,
  onProcessRowUpdateError,
  isOrderFullyComplete = false,
}: Props) {
  // Packing becomes editable only when every row is fully issued
  const allIssued =
    rows.length > 0 && rows.every((r) => r.issueStage >= r.reqQuantity);

  // helper to compute per-row status & return per-cell class
  const cellClass: NonNullable<GridColDef<MaterialRow>["cellClassName"]> = (
    params
  ) => {
    const r = params.row as MaterialRow;
    const field = params.field as keyof MaterialRow;

    const reqEqIssue = r.reqQuantity === r.issueStage;
    const packingCap = Math.min(r.reqQuantity, r.issueStage);
    const packedDone =
      r.packingStage >= packingCap && r.issueStage >= r.reqQuantity;

    // State 3 (final): when packing is done -> whole row including packing cell is green
    if (packedDone) {
      return "hl-green";
    }

    // State 1: before packing is enabled but row fully issued -> row green EXCEPT packing cell
    if (!allIssued && reqEqIssue) {
      return field === "packingStage" ? "" : "hl-green";
    }

    // State 2: packing is enabled globally; rows that were green now become yellow until packed
    if (allIssued && reqEqIssue) {
      return field === "packingStage" ? "" : "hl-yellow";
    }

    return "";
  };

  const columns: GridColDef<MaterialRow>[] = [
    {
      field: "siNo",
      headerName: "S.No",
      align: "center",
      width: 50,
      cellClassName: cellClass,
    },
    {
      field: "materialCode",
      headerName: "Material Code",
      width: 150,
      cellClassName: cellClass,
    },
    {
      field: "materialDescription",
      headerName: "Description",
      width: 250,
      cellClassName: cellClass,
    },
    {
      field: "batchNo",
      headerName: "Batch No",
      width: 130,
      cellClassName: cellClass,
    },
    {
      field: "soDonorBatch",
      headerName: "SO DONOR Batch",
      width: 150,
      cellClassName: cellClass,
    },
    {
      field: "certNo",
      headerName: "Cert No",
      width: 130,
      cellClassName: cellClass,
    },
    {
      field: "binNo",
      headerName: "Bin No",
      width: 120,
      cellClassName: cellClass,
    },
    { field: "adf", headerName: "A/D/F", width: 120, cellClassName: cellClass },
    {
      field: "reqQuantity",
      headerName: "Required Qty",
      width: 120,
      align: "center",
      headerAlign: "center",
      cellClassName: cellClass,
    },
    {
      field: "issueStage",
      headerName: "Issue Stage",
      type: "number",
      width: 120,
      editable: !isOrderFullyComplete && Boolean(onUpdateIssueStage),
      align: "center",
      headerAlign: "center",
      cellClassName: cellClass,
    },
    {
      field: "packingStage",
      headerName: "Packing Stage",
      type: "number",
      width: 120,
      editable:
        !isOrderFullyComplete && Boolean(onUpdatePackingStage) && allIssued,
      align: "center",
      headerAlign: "center",
      // cellClassName: allIssued ? "" : "packing-disabled",
      cellClassName: (p) => {
        const base = `${cellClass(p) ?? ""}`;
        return (allIssued ? base : `${base} packing-disabled`).trim();
      },
    },
  ];

  const getRowClassName = (params: GridRowClassNameParams<MaterialRow>) => {
    const r = params.row;
    const packedCap = Math.min(r.reqQuantity, r.issueStage);
    const fulfilled =
      r.packingStage >= packedCap && r.issueStage >= r.reqQuantity;
    return fulfilled ? "bg-green-50" : "";
  };

  const processRowUpdate = async (newRow: MaterialRow, oldRow: MaterialRow): Promise<MaterialRow> => {
    if (isOrderFullyComplete) return oldRow;

    const issueChanged = newRow.issueStage !== oldRow.issueStage;
    const packingChanged = newRow.packingStage !== oldRow.packingStage;

    try {
      if (issueChanged) {
        if (!onUpdateIssueStage) return oldRow;
        const cap = newRow.reqQuantity;
        if (newRow.issueStage < 0 || newRow.issueStage > cap) {
          throw new Error(`Issue Stage must be between 0 and ${cap}`);
        }
        const updatedRow = await onUpdateIssueStage(newRow.materialCode, newRow.issueStage);
        if (!updatedRow) {
          throw new Error("Update failed: Server returned no data.");
        }
        return updatedRow;
      }

      if (packingChanged) {
        if (!onUpdatePackingStage) return oldRow;
        const cap = Math.min(newRow.reqQuantity, newRow.issueStage);
        if (!allIssued) {
          throw new Error("Packing is locked until all items are fully issued.");
        }
        if (newRow.packingStage < 0 || newRow.packingStage > cap) {
          throw new Error(`Packing Stage must be between 0 and ${cap}`);
        }
        const updatedRow = await onUpdatePackingStage(newRow.materialCode, newRow.packingStage);
        if (!updatedRow) {
          throw new Error("Update failed: Server returned no data.");
        }
        return updatedRow;
      }
    } catch (error) {
      if (error instanceof Error) {
        onProcessRowUpdateError?.(error);
      }
      // Re-throwing the error is crucial for DataGrid to handle it and revert the cell value.
      throw error;
    }

    return oldRow;
  };

  const handleDefaultError = (error: Error): void => {
    onProcessRowUpdateError?.(error);
  };

  const rowsWithUniqueId = rows.map((row) => ({
    ...row,
    id: Number(row.id),
  }));

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{ background: "white" }}
    >
      <DataGrid
        className="border-0"
        rows={rowsWithUniqueId}
        columns={columns}
        getRowId={(r) => r.id}
        disableRowSelectionOnClick
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={handleDefaultError}
        loading={loading}
        getRowClassName={getRowClassName}
        sx={{
          "& .MuiDataGrid-row": {
            "&.bg-green-50": {
              backgroundColor: (theme) =>
                alpha(theme.palette.success.light, 0.2),
            },
          },
          "& .MuiDataGrid-cell": {
            outline: "none !important",
            transition: "background-color 160ms ease-in-out",
          },
          // single definition only (no duplicates)
          "& .packing-disabled": {
            backgroundColor: alpha("#ccc", 0.3),
            color: "#888",
            pointerEvents: "none",
          },
          "& .hl-green": {
            backgroundColor: alpha("#2ea043", 0.18), // subtle green
          },
          "& .hl-yellow": {
            backgroundColor: alpha("#ffc107", 0.18), // subtle yellow
          },
        }}
      />
    </div>
  );
}
