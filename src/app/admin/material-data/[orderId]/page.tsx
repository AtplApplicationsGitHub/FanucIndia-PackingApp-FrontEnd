"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Alert } from "@mui/material";
import HeaderSection from "../components/HeaderSection";
import InputBoxSection from "../components/InputBoxSection";
import MaterialDataTable from "../components/MaterialDataTable";
import { useErpMaterials, useIncrementIssueStage } from "../hooks/useErpMaterials";
import { useOrderHeader } from "../hooks/useOrderHeader";
import { updateIssueStage } from "../../../../lib/api";

type ApiError = {
  response?: {
    data?: {
      message?: string | { message?: string };
    };
  };
  message?: string;
};

function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    try { return extractErrorMessage(JSON.parse(error)); }
    catch { return error; }
  }
  if (error instanceof Error) {
    try { return extractErrorMessage(JSON.parse(error.message)); }
    catch { return error.message; }
  }
  const err = error as ApiError;
  const msg = err.response?.data?.message;
  if (msg) {
    return typeof msg === "string" ? msg : msg.message ?? "Something went wrong.";
  }
  return "Something went wrong. Please try again.";
}

export default function MaterialDataPage() {
  const params = useParams();
  const rawId = params.orderId;

  // reject missing or array IDs
  if (!rawId || Array.isArray(rawId)) {
    return <Alert severity="error" sx={{ m: 6 }}>Invalid Order ID in URL.</Alert>;
  }

  const orderId = Number(rawId);
  if (isNaN(orderId)) {
    return <Alert severity="error" sx={{ m: 6 }}>Order ID is not a number.</Alert>;
  }

  const [editError, setEditError] = useState<string | null>(null);

  // now always pass the numeric orderId
  const { data: header, error: hdrError } = useOrderHeader(orderId);
  const { data: rows = [], error: matError, refetch } = useErpMaterials(orderId);
  const { mutate, loading: mutating, error: mutErr } = useIncrementIssueStage(orderId);

  if (hdrError || matError) {
    return (
      <Alert severity="error" sx={{ m: 6 }}>
        Failed to load data: {extractErrorMessage(hdrError ?? matError)}
      </Alert>
    );
  }
  if (!header) {
    return <Alert severity="info" sx={{ m: 6 }}>Loading order header...</Alert>;
  }

  const { so, customerName, transferOrder, fgObd } = header;
  const machineModel = rows[0]?.machineModel ?? "";
  const cncSerialNo = rows[0]?.cncSerialNo ?? "";

  const handleProcess = async (code: string) => {
    setEditError(null);
    try {
      await mutate(code);
      refetch();
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
    }
  };

  const handleRowUpdate = async (code: string, stage: number) => {
    setEditError(null);
    try {
      const data = await updateIssueStage(orderId, code, stage);
      const raw = data as Record<string, unknown>;
      const candidate = raw.updatedMaterial ?? raw.updatedRow ?? raw.updated ?? raw;
      const m = (typeof candidate === "object" && candidate !== null)
        ? (candidate as Record<string, unknown>)
        : raw;

      const old = rows.find(r =>
        r.materialCode === code ||
        (typeof m["ID"] === "number" ? r.id === m["ID"] : false)
      ) ?? rows[0]!;

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

      return {
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
        machineModel: getString("Machine_Model", old.machineModel),
        cncSerialNo: getString("CNC_Serial_No", old.cncSerialNo),
      };
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
      throw err;
    }
  };

  return (
    <main className="p-6 space-y-6">
      <HeaderSection
        so={so}
        customerName={customerName}
        transferOrder={transferOrder}
        fgObd={fgObd}
        machineModel={machineModel}
        cncSerialNo={cncSerialNo}
      />

      <InputBoxSection onSubmit={handleProcess} />

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
        rows={rows}
        loading={mutating}
        onUpdateIssueStage={handleRowUpdate}
        onProcessRowUpdateError={err => setEditError(extractErrorMessage(err))}
      />
    </main>
  );
}
