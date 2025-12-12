"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
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
  bulkAcceptGroup,
} from "@/common/services/erp.service";
import type { MaterialRow } from "@/app/admin/material-data/types/material-row";
import axios from "axios";

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.message === 'string') {
        return parsed.message;
      }
    } catch {
      return error.message;
    }
  }
  if (axios.isAxiosError(error)) {
    if (error.response?.data && typeof error.response.data.message === 'string') {
      return error.response.data.message;
    }
  }

  return 'An unexpected error occurred.';
}

export default function MaterialDataPage2() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter(); // [FIX] Defined router
  
  // [FIX] Updated type to include role and name
  const [currentUser, setCurrentUser] = useState<{ id: number | null; role: string | null; name: string }>({ 
    id: null, 
    role: null, 
    name: "" 
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // [FIX] Set all user properties
        setCurrentUser({ id: user.id, role: user.role, name: user.name });
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);
  
  const idStr = useMemo(
    () => (typeof params.orderId === "string" ? params.orderId : ""),
    [params.orderId]
  );
  const orderId = Number(idStr);  

  const [editError, setEditError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  // [FIX] Properly destructure setIsRedirecting
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: header, error: hdrError } = useOrderHeader(orderId, currentUser.id);
  const {
    rows: fetchedRows = [],
    error: matError,
    loading: matLoading,
  } = useErpMaterials(orderId, currentUser.id);
  
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
  const [showAll, setShowAll] = useState(false); // [FIX] Ensure showAll is defined
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null); // [NEW] Group Filter State

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

  // [FIX] Define allIssued so it can be used in filters
  const allIssued = useMemo(() => 
    localRows.length > 0 && localRows.every((r) => r.issueStage >= r.reqQuantity),
  [localRows]);

  // [NEW] Compute Unique Groups
  const uniqueGroups = useMemo(() => {
    const groups = localRows
      .map((r) => r.group)
      .filter((g): g is string => !!g); 
    return Array.from(new Set(groups)).sort();
  }, [localRows]);

  // [NEW] Compute Displayed Rows with Group Filter
  const displayedRows = useMemo(() => {
    let rows = localRows;

    // 1. Group Filter
    if (selectedGroup) {
      rows = rows.filter((r) => r.group === selectedGroup);
    }

    // 2. Show All / Pending Filter
    if (!showAll) {
      if (!allIssued) {
        rows = rows.filter((r) => r.issueStage < r.reqQuantity);
      } else {
        rows = rows.filter((r) => r.packingStage < r.reqQuantity);
      }
    }
    return rows;
  }, [localRows, showAll, allIssued, selectedGroup]);

  // [NEW] Bulk Accept Handler
  const handleBulkAccept = async () => {
    if (!selectedGroup) return;
    
    // Determine stage based on current status
    const stageType = !allIssued ? 'issue' : 'packing';
    
    try {
      setUploadNotice("Processing bulk update...");
      const res = await bulkAcceptGroup(orderId, selectedGroup, stageType);
      
      if (res.issueStageCompleted || res.packingStageCompleted) {
         setUploadNotice("Stage complete! Redirecting...");
         setIsRedirecting(true);
         setTimeout(() => {
            if (currentUser.role === 'ADMIN') router.push("/admin/dashboard");
            else {
               sessionStorage.setItem("userDashboardView", "pick_pack");
               router.push("/user/dashboard");
            }
         }, 2500);
      } else {
         setUploadNotice("Group accepted successfully");
         await refetch();
      }
    } catch (e) {
      setEditError(extractErrorMessage(e));
    }
  };

  if (!idStr) {
    return <Alert severity="error" sx={{ m: 6 }}>Invalid Order ID in URL.</Alert>;
  }
  if (isNaN(orderId)) {
    return <Alert severity="error" sx={{ m: 6 }}>Order ID is not a number.</Alert>;
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
      <Backdrop open sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  const busy = matLoading || mutatingIssue || mutatingPacking || isRedirecting;

  const { so, customerName, transferOrder, fgObd } = header;
  const machineModel = localRows[0]?.machineModel ?? "";
  const cncSerialNo = localRows[0]?.cncSerialNo ?? "";

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
    Group?: string;
    Accept_Bulk_Data?: boolean | string;
    Mapping_Barcode?: string;
    Remarks_Required?: boolean | string;
  };

  const refetch = async () => {
    try {
      const data = await fetchErpMaterials(orderId);
      const apiRows = (Array.isArray(data?.items) ? data.items : data) as ApiMaterial[];
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
        // New fields
        group: m.Group || "",
        mappingBarcode: m.Mapping_Barcode || "",
        acceptBulkData: String(m.Accept_Bulk_Data).toLowerCase() === 'true',
        remarksRequired: String(m.Remarks_Required).toLowerCase() === 'true',
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
        // Optimistic update
        setLocalRows((prev) =>
          prev.map((r) =>
            r.materialCode === code || r.mappingBarcode === code
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
        // Optimistic update
        setLocalRows((prev) =>
          prev.map((r) =>
            r.materialCode === code || r.mappingBarcode === code
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

  const handleUpdateIssueStage = async (code: string, stage: number, id: number) => {
    setEditError(null);
    try {
      await updateIssueStage(orderId, code, stage, id);
      await refetch();
      return null; 
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
      throw err;
    }
  };

  const handleUpdatePackingStage = async (code: string, stage: number, id: number) => {
    setEditError(null);
    try {
      await updatePackingStage(orderId, code, stage, id);
      await refetch();
      return null;
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
      throw err;
    }
  };

  const mutErr = allIssued ? mutErrPacking : mutErrIssue;

  return (
    <main className="p-6 space-y-6">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
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
          disabled={isOrderFullyComplete || busy}
          items={localRows}
          uniqueGroups={uniqueGroups}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          onBulkAccept={handleBulkAccept}
          showAll={showAll}
          onToggleShowAll={setShowAll}
        />
      )}

      {mutErr && <Alert severity="error" className="my-4">{extractErrorMessage(mutErr)}</Alert>}
      {editError && <Alert severity="error" className="my-4">{editError}</Alert>}

      <MaterialDataTable
        rows={displayedRows}
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