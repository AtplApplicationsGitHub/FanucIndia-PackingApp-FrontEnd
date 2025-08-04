"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Alert, Box } from "@mui/material";
import HeaderSection from "../components/HeaderSection";
import InputBoxSection from "../components/InputBoxSection";
import MaterialDataTable from "../components/MaterialDataTable";
import { useErpMaterials, useIncrementIssueStage } from "../hooks/useErpMaterials";
import { useOrderHeader } from "../hooks/useOrderHeader";
import { updateIssueStage } from "../../../../lib/api";

function extractErrorMessage(error: any): string {
  if (typeof error === "string") {
    try { return extractErrorMessage(JSON.parse(error)); } catch { return error; }
  }
  if (error?.message) {
    const msg = error.message;
    if (typeof msg === "string") {
      try { return extractErrorMessage(JSON.parse(msg)); } catch { return msg; }
    }
    if (msg?.message) return msg.message;
  }
  if (error?.response?.data?.message) {
    const m = error.response.data.message;
    return typeof m === "string" ? m : m.message ?? "Something went wrong.";
  }
  return "Something went wrong. Please try again.";
}

export default function MaterialDataPage() {
  const orderId = Number(useParams().orderId);
  const [editError, setEditError] = useState<string | null>(null);

  const { data: header, error: hdrError } = useOrderHeader(orderId);
  const { data: rows = [], error: matError, refetch } = useErpMaterials(orderId);
  const { mutate, loading: mutating, error: mutErr } = useIncrementIssueStage(orderId);

  if (isNaN(orderId)) {
    return <Alert severity="error" sx={{ m: 6 }}>Invalid Order ID in URL.</Alert>;
  }

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
    } catch {
      // error displayed below
    }
  };

  const handleRowUpdate = async (code: string, stage: number) => {
    try {
      setEditError(null);
      const data = await updateIssueStage(orderId, code, stage);
      const m = data.updatedMaterial || data.updatedRow || data.updated || data;
      const old = rows.find(
        (r) => r.materialCode === code || r.id === m.ID
      ) || rows[0]!;

      return {
        ...old,
        id:
          m.ID != null && !isNaN(Number(m.ID)) ? Number(m.ID) : old.id,
        siNo: m.SI_No ?? old.siNo,
        materialCode: m.Material_Code ?? old.materialCode,
        materialDescription:
          m.Material_Description ?? old.materialDescription,
        batchNo: m.Batch_No ?? old.batchNo,
        soDonorBatch:
          m.SO_Donor_Batch ?? old.soDonorBatch,
        certNo: m.Cert_No ?? old.certNo,
        binNo: m.Bin_No ?? old.binNo,
        adf: m.A_D_F ?? old.adf,
        reqQuantity:
          m.Required_Qty ?? old.reqQuantity,
        issueStage:
          m.Issue_stage ?? old.issueStage,
        machineModel:
          m.Machine_Model ?? old.machineModel,
        cncSerialNo:
          m.CNC_Serial_No ?? old.cncSerialNo,
      };
    } catch (err: any) {
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
        onProcessRowUpdateError={(err) =>
          setEditError(extractErrorMessage(err))
        }
      />
    </main>
  );
}
