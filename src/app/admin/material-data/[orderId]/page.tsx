"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Backdrop,
  CircularProgress,
  Snackbar,
  Box,
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

// Robust error message extractor (keeps your original behavior)
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
  // ---- URL / ID handling (preserved)
  const params = useParams<{ orderId: string }>();
  const idStr = useMemo(
    () => (typeof params.orderId === "string" ? params.orderId : ""),
    [params.orderId]
  );
  const orderId = Number(idStr);  

  // ---- notices & errors (preserved)
  const [editError, setEditError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // ---- data hooks
  const { data: header, error: hdrError } = useOrderHeader(orderId);

  // Your original hook returned SWR-style { data, error, refetch }.
  // Our current hook returns { rows, loading, error }. We’ll keep a local copy, like before.
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

  // Keep localRows + sync (preserved behavior)
  const [localRows, setLocalRows] = useState<MaterialRow[]>(fetchedRows);
  useEffect(() => {
    setLocalRows(fetchedRows);
  }, [fetchedRows]);

  // Validate ID early (preserved)
  if (!idStr) {
    return (
      <Alert severity="error" sx={{ m: 6 }}>
        Invalid Order ID in URL.
      </Alert>
    );
  }
  if (isNaN(orderId)) {
    return (
      <Alert severity="error" sx={{ m: 6 }}>
        Order ID is not a number.
      </Alert>
    );
  }

  // Show load/error states (preserved)
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

  // Local refetch to preserve old “refetch()” flow without a hard reload
  // We map API data back to MaterialRow shape if API returns raw items.
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

  // ---- scan submit (preserved pattern + now supports Packing)
  const handleProcess = async (code: string) => {
    setEditError(null);
    try {
      if (!allIssued) {
        await incIssue(code);
        // optimistic ++ for Issue
        setLocalRows((prev) =>
          prev.map((r) =>
            r.materialCode === code
              ? {
                  ...r,
                  issueStage: Math.min(
                    (Number(r.issueStage) || 0) + 1,
                    Number(r.reqQuantity) || 0,
                  ),
                }
              : r,
          ),
        );
      } else {
        await incPacking(code);
        // optimistic ++ for Packing
        setLocalRows((prev) =>
          prev.map((r) =>
            r.materialCode === code
              ? {
                  ...r,
                  packingStage: Math.min(
                    (Number(r.packingStage) || 0) + 1,
                    Math.min(Number(r.reqQuantity) || 0, Number(r.issueStage) || 0),
                  ),
                }
              : r,
          ),
        );
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
      const raw = data as Record<string, unknown>;
      const candidate =
        (raw.updatedMaterial as Record<string, unknown> | undefined) ??
        (raw.updatedRow as Record<string, unknown> | undefined) ??
        (raw.updated as Record<string, unknown> | undefined) ??
        raw;
      const m =
        typeof candidate === "object" && candidate !== null
          ? (candidate as Record<string, unknown>)
          : raw;

      const old =
        localRows.find(
          (r) =>
            r.materialCode === code ||
            (typeof m["ID"] === "number" ? r.id === m["ID"] : false),
        ) ?? localRows[0]!;

      const getNumber = (key: string, fallback: number): number => {
        const v = m[key];
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          const n = Number(v);
          return isNaN(n) ? fallback : n;
        }
        return fallback;
      };
      const getString = (key: string, fallback: string): string => {
        const v = m[key];
        return typeof v === "string" ? v : fallback;
      };

      const updatedRow: MaterialRow = {
        ...old,
        id: getNumber("ID", old.id),
        siNo: getNumber("SI_No", old.siNo),
        materialCode: getString("Material_Code", old.materialCode),
        materialDescription: getString("Material_Description", old.materialDescription),
        batchNo: getString("Batch_No", old.batchNo),
        soDonorBatch: getString("SO_Donor_Batch", old.soDonorBatch),
        certNo: getString("Cert_No", old.certNo),
        binNo: getString("Bin_No", old.binNo),
        adf: getString("A_D_F", old.adf),
        reqQuantity: getNumber("Required_Qty", old.reqQuantity),
        issueStage: getNumber("Issue_stage", old.issueStage),
        packingStage: getNumber("Packing_stage", old.packingStage ?? 0),
        machineModel: getString("Machine_Model", old.machineModel ?? ""),
        cncSerialNo: getString("CNC_Serial_No", old.cncSerialNo ?? ""),
      };

      setLocalRows((prev) =>
        prev.map((r) =>
          r.materialCode === code ||
          (typeof m["ID"] === "number" ? r.id === m["ID"] : false)
            ? updatedRow
            : r,
        ),
      );

      return updatedRow;
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
      throw err;
    }
  };

  const handleUpdatePackingStage = async (code: string, stage: number) => {
    setEditError(null);
    try {
      const data = await updatePackingStage(orderId, code, stage);
      const raw = data as Record<string, unknown>;
      const candidate =
        (raw.updatedMaterial as Record<string, unknown> | undefined) ??
        (raw.updatedRow as Record<string, unknown> | undefined) ??
        (raw.updated as Record<string, unknown> | undefined) ??
        raw;
      const m =
        typeof candidate === "object" && candidate !== null
          ? (candidate as Record<string, unknown>)
          : raw;

      const old =
        localRows.find(
          (r) =>
            r.materialCode === code ||
            (typeof m["ID"] === "number" ? r.id === m["ID"] : false),
        ) ?? localRows[0]!;

      const getNumber = (key: string, fallback: number): number => {
        const v = m[key];
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          const n = Number(v);
          return isNaN(n) ? fallback : n;
        }
        return fallback;
      };
      const getString = (key: string, fallback: string): string => {
        const v = m[key];
        return typeof v === "string" ? v : fallback;
      };

      const updatedRow: MaterialRow = {
        ...old,
        id: getNumber("ID", old.id),
        siNo: getNumber("SI_No", old.siNo),
        materialCode: getString("Material_Code", old.materialCode),
        materialDescription: getString("Material_Description", old.materialDescription),
        batchNo: getString("Batch_No", old.batchNo),
        soDonorBatch: getString("SO_Donor_Batch", old.soDonorBatch),
        certNo: getString("Cert_No", old.certNo),
        binNo: getString("Bin_No", old.binNo),
        adf: getString("A_D_F", old.adf),
        reqQuantity: getNumber("Required_Qty", old.reqQuantity),
        issueStage: getNumber("Issue_stage", old.issueStage),
        packingStage: getNumber("Packing_stage", old.packingStage ?? 0),
        machineModel: getString("Machine_Model", old.machineModel ?? ""),
        cncSerialNo: getString("CNC_Serial_No", old.cncSerialNo ?? ""),
      };

      setLocalRows((prev) =>
        prev.map((r) =>
          r.materialCode === code ||
          (typeof m["ID"] === "number" ? r.id === m["ID"] : false)
            ? updatedRow
            : r,
        ),
      );

      return updatedRow;
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
      throw err;
    }
  };

  const mutErr = allIssued ? mutErrPacking : mutErrIssue;

  return (
    <main className="p-6 space-y-6">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <HeaderSection
          so={so}
          customerName={customerName}
          transferOrder={transferOrder}
          fgObd={fgObd}
          machineModel={machineModel}
          cncSerialNo={cncSerialNo}
          items={localRows}
        />
      </Box>

      <InputBoxSection
        onSubmit={handleProcess}
        saleOrderNumber={so}
        onFileCreated={() => {
          setUploadNotice("File metadata saved");
          refetch();
        }}
      />

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
