"use client";

// This is the new shared page for the detailed order view.
// Its content is moved from the old admin-specific page.

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Backdrop,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import HeaderSection from "@/app/admin/material-data/components/HeaderSection";
import InputBoxSection from "@/app/admin/material-data/components/InputBoxSection";
import MaterialDataTable from "@/app/admin/material-data/components/MaterialDataTable";
import {
  useErpMaterials,
  useIncrementIssueStage,
  useIncrementPackingStage,
} from "@/app/admin/material-data/hooks/useErpMaterials";
import { useOrderHeader } from "@/app/admin/material-data/hooks/useOrderHeader";
import {
  updateIssueStage,
  updatePackingStage,
  getErpMaterials as fetchErpMaterials,
} from "@/common/lib/api";
import type { MaterialRow } from "@/app/admin/material-data/types/material-row";

type ApiError = {
  response?: { data?: { message?: string | { message?: string } } };
  message?: string;
};
function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    try {
      return extractErrorMessage(JSON.parse(error));
    } catch {
      return error;
    }
  }
  if (error instanceof Error) {
    try {
      return extractErrorMessage(JSON.parse(error.message));
    } catch {
      return error.message;
    }
  }
  const err = error as ApiError;
  const msg = err.response?.data?.message;
  return msg
    ? typeof msg === "string"
      ? msg
      : (msg.message ?? "Something went wrong.")
    : "Something went wrong. Please try again.";
}

export default function MaterialDataPage() {
  const params = useParams<{ orderId: string }>();
  const idStr = useMemo(
    () => (typeof params.orderId === "string" ? params.orderId : ""),
    [params.orderId]
  );
  const orderId = Number(idStr);  

  const [editError, setEditError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const { data: header, error: hdrError } = useOrderHeader(orderId);
  const {
    rows: fetchedRows = [],
    error: matError,
    loading: matLoading,
  } = useErpMaterials(orderId);

  const {
    mutate: incIssue,
    loading: mutatingIssue,
    error: mutErrIssue,
  } = useIncrementIssueStage(orderId);

  const {
    mutate: incPacking,
    loading: mutatingPacking,
    error: mutErrPacking,
  } = useIncrementPackingStage(orderId);

  const [localRows, setLocalRows] = useState<MaterialRow[]>(fetchedRows);
  useEffect(() => {
    setLocalRows(fetchedRows);
  }, [fetchedRows]);
  
  const isOrderFullyComplete = useMemo(() => {
    if (!localRows || localRows.length === 0) {
      return false;
    }
    return localRows.every(
      (row) =>
        row.reqQuantity > 0 &&
        row.reqQuantity === row.issueStage &&
        row.issueStage === row.packingStage
    );
  }, [localRows]);


  if (!idStr || isNaN(orderId)) {
    return (
      <Alert severity="error" sx={{ m: 6 }}>
        Invalid Order ID in URL.
      </Alert>
    );
  }

  if (hdrError || matError) {
    return (
      <Alert severity="error" sx={{ m: 6 }}>
        Failed to load data: {extractErrorMessage(hdrError ?? matError)}
      </Alert>
    );
  }
  if (!header) {
    return (
      <Backdrop
        open
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  const busy = matLoading || mutatingIssue || mutatingPacking;

  const { so, customerName, transferOrder, fgObd } = header;
  const machineModel = localRows[0]?.machineModel ?? "";
  const cncSerialNo = localRows[0]?.cncSerialNo ?? "";

  const allIssued =
    localRows.length > 0 &&
    localRows.every((r) => r.issueStage >= r.reqQuantity);

  type ApiMaterial = {
    ID: number;
    Material_Code: string;
    Material_Description: string;
    Batch_No: string;
    SO_Donor_Batch: string;
    Cert_No: string;
    Bin_No: string;
    A_D_F: string;
    Required_Qty: number;
    Issue_stage: number;
    Packing_stage?: number;
    Machine_Model?: string;
    CNC_Serial_No?: string;
  };
  const refetch = async () => {
    try {
      const data = await fetchErpMaterials(orderId);
      const apiRows = (
        Array.isArray(data?.items) ? data.items : data
      ) as ApiMaterial[];
      const mapped: MaterialRow[] = apiRows.map((m, idx) => ({
        id: Number(m.ID),
        siNo: idx + 1,
        materialCode: m.Material_Code,
        materialDescription: m.Material_Description,
        batchNo: m.Batch_No,
        soDonorBatch: m.SO_Donor_Batch,
        certNo: m.Cert_No,
        binNo: m.Bin_No,
        adf: m.A_D_F,
        reqQuantity: m.Required_Qty,
        issueStage: m.Issue_stage,
        packingStage: m.Packing_stage ?? 0,
        machineModel: m.Machine_Model ?? "",
        cncSerialNo: m.CNC_Serial_No ?? "",
      }));
      setLocalRows(mapped);
    } catch (e) {
      setEditError(extractErrorMessage(e));
    }
  };

  const handleProcess = async (code: string) => {
    setEditError(null);
    try {
      if (!allIssued) {
        await incIssue(code);
      } else {
        await incPacking(code);
      }
      await refetch();
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
    }
  };

  const handleUpdateIssueStage = async (code: string, stage: number) => {
    setEditError(null);
    try {
      const data = await updateIssueStage(orderId, code, stage);
      await refetch();
      return data as MaterialRow;
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
      throw err;
    }
  };

  const handleUpdatePackingStage = async (code: string, stage: number) => {
    setEditError(null);
    try {
      const data = await updatePackingStage(orderId, code, stage);
      await refetch();
      return data as MaterialRow;
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
      throw err;
    }
  };

  const mutErr = allIssued ? mutErrPacking : mutErrIssue;

  return (
    <main className="p-6 space-y-6">
      <HeaderSection
        so={so}
        customerName={customerName}
        transferOrder={transferOrder}
        fgObd={fgObd}
        machineModel={machineModel}
        cncSerialNo={cncSerialNo}
        items={localRows}
      />

      {isOrderFullyComplete ? (
        <Alert severity="success" sx={{ my: 4 }}>
          This order is fully packed and complete. No further actions can be taken.
        </Alert>
      ) : (
        <InputBoxSection
          onSubmit={handleProcess}
          saleOrderNumber={so}
          onFileCreated={() => {
            setUploadNotice("File metadata saved");
            refetch();
          }}
          disabled={isOrderFullyComplete}
        />
      )}

      {mutErr && (
        <Alert severity="error" className="my-4">
          {extractErrorMessage(mutErr)}
        </Alert>
      )}
      {editError && (
        <Alert severity="error" className="my-4">
          {editError}
        </Alert>
      )}

      <MaterialDataTable
        rows={localRows}
        loading={busy}
        onUpdateIssueStage={handleUpdateIssueStage}
        onUpdatePackingStage={handleUpdatePackingStage}
        onProcessRowUpdateError={(err) => setEditError(extractErrorMessage(err))}
        isOrderFullyComplete={isOrderFullyComplete}
      />

      <Snackbar
        open={!!uploadNotice}
        autoHideDuration={3000}
        onClose={() => setUploadNotice(null)}
      >
        <Alert severity="success" onClose={() => setUploadNotice(null)}>
          {uploadNotice}
        </Alert>
      </Snackbar>
    </main>
  );
}
