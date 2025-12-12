"use client";

import { useState, useEffect, useMemo, SetStateAction } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Backdrop,
  CircularProgress,
  Snackbar,
  Box,
  Container,
  Paper,
  Divider,
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
  updateMaterialRemarks,
} from "@/common/services/erp.service";
import type { MaterialRow } from "@/app/admin/material-data/types/material-row";
import axios from "axios";

import AdminDashboardHeader, {
  ViewType,
} from "@/app/admin/components/dashboard/Header";
import UserDashboardHeader from "@/app/user/components/Header";
import { UserDashboardView } from "@/app/user/hooks/useUserDashboard";
import SalesDashboardHeader from "@/app/sales/components/Header";
import { SalesDashboardView } from "@/app/sales/components/hooks/useSalesDashboard";

type UpdateResponse = {
  issueStageCompleted?: boolean;
  packingStageCompleted?: boolean;
  updatedMaterial?: {
    ID: number;
    Remarks?: string;
    Issue_stage?: number;
    Packing_stage?: number;
    [key: string]: unknown;
  };
};

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.message === "string") {
        return parsed.message;
      }
    } catch {
      return error.message;
    }
  }
  if (axios.isAxiosError(error)) {
    if (
      error.response?.data &&
      typeof error.response.data.message === "string"
    ) {
      return error.response.data.message;
    }
  }
  return "An unexpected error occurred.";
}

export default function MaterialDataPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<{
    id: number | null;
    role: string | null;
    name: string;
  }>({
    id: null,
    role: null,
    name: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser({ id: user.id, role: user.role, name: user.name || "" });
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
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: header, error: hdrError } = useOrderHeader(
    orderId,
    currentUser.id
  );
  const {
    rows: fetchedRows = [],
    error: matError,
    loading: matLoading,
  } = useErpMaterials(orderId, currentUser.id);

  const { mutate: incIssue, loading: mutatingIssue } = useIncrementIssueStage(
    orderId
  );

  const { mutate: incPacking, loading: mutatingPacking } =
    useIncrementPackingStage(orderId);

  // Group Filter State
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const [localRows, setLocalRows] = useState<MaterialRow[]>(fetchedRows);
  const [showAll, setShowAll] = useState(false);

  // Determine global stage (Issue vs Packing)
  const allIssued = useMemo(
    () =>
      localRows.length > 0 &&
      localRows.every((r) => r.issueStage >= r.reqQuantity),
    [localRows]
  );

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

  const handleUpdateRemarks = async (id: number, remarks: string) => {
    try {
      const response = await updateMaterialRemarks(orderId, id, remarks) as UpdateResponse;
      
      setUploadNotice("Remarks updated successfully");

      const updatedMaterial = response.updatedMaterial;
      
      setLocalRows((prev) =>
        prev.map((row) =>
          row.id === id 
            ? { ...row, remarks: updatedMaterial ? updatedMaterial.Remarks : remarks } 
            : row
        )
      );

    } catch (e) {
      setEditError(extractErrorMessage(e));
    }
  };

  const uniqueGroups = useMemo(() => {
    const groups = localRows
      .map((r) => r.group)
      .filter((g): g is string => !!g); 
    return Array.from(new Set(groups)).sort();
  }, [localRows]);

  const displayedRows = useMemo(() => {
    let rows = localRows;

    if (selectedGroup) {
      rows = rows.filter((r) => r.group === selectedGroup);
    }

    if (!showAll) {
      if (!allIssued) {
        rows = rows.filter((r) => r.issueStage < r.reqQuantity);
      } else {
        rows = rows.filter((r) => r.packingStage < r.reqQuantity);
      }
    }
    return rows;
  }, [localRows, showAll, allIssued, selectedGroup]);

  // [UPDATED] Logic to show "Accept Group Items" button
  // 1. Group must be selected.
  // 2. At least one item in the group must have `acceptBulkData === true`.
  // 3. At least one of those items must be INCOMPLETE for the current stage.
  const showBulkButton = useMemo(() => {
    if (!selectedGroup) return false;

    // Filter strictly by the selected group first
    const groupRows = localRows.filter((r) => r.group === selectedGroup);

    return groupRows.some((r) => {
      // Must be flagged for bulk accept
      if (!r.acceptBulkData) return false;

      // Must be incomplete
      if (!allIssued) {
        // Issue Stage
        return r.issueStage < r.reqQuantity;
      } else {
        // Packing Stage
        return r.packingStage < r.reqQuantity;
      }
    });
  }, [selectedGroup, localRows, allIssued]);

  const renderHeader = () => {
    if (!currentUser.role) return null;

    const handleAdminNav = (view: SetStateAction<ViewType>) => {
      const newView =
        typeof view === "function"
          ? (view as (prev: ViewType) => ViewType)("orders")
          : view;
      sessionStorage.setItem("adminView", newView);
      router.push("/admin/dashboard");
    };

    const handleUserNav = (view: UserDashboardView) => {
      sessionStorage.setItem("userDashboardView", view);
      router.push("/user/dashboard");
    };

    const handleSalesNav = (view: SalesDashboardView) => {
      sessionStorage.setItem("salesDashboardView", view);
      router.push("/sales/dashboard");
    };

    switch (currentUser.role) {
      case "ADMIN":
        return (
          <AdminDashboardHeader
            userName={currentUser.name}
            view={"orders"}
            setView={handleAdminNav}
          />
        );
      case "USER":
        return (
          <UserDashboardHeader view={"pick_pack"} setView={handleUserNav} />
        );
      case "SALES":
        return (
          <SalesDashboardHeader view={"orders"} setView={handleSalesNav} />
        );
      default:
        return null;
    }
  };

  const handleBulkAccept = async () => {
    if (!selectedGroup) return;
    const stageType = !allIssued ? "issue" : "packing";

    try {
      setUploadNotice("Processing bulk update...");
      const res = await bulkAcceptGroup(orderId, selectedGroup, stageType);

      if (res.issueStageCompleted || res.packingStageCompleted) {
        setUploadNotice("Stage complete! Redirecting...");
        setIsRedirecting(true);
        setTimeout(() => {
          if (currentUser.role === "ADMIN") {
            router.push("/admin/dashboard");
          } else {
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

  if (!idStr || isNaN(orderId)) {
    return <Alert severity="error" sx={{ m: 6 }}>Invalid Order ID.</Alert>;
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
        group: m.Group || "",
        mappingBarcode: m.Mapping_Barcode || "",
        acceptBulkData: String(m.Accept_Bulk_Data).toLowerCase() === "true",
        remarksRequired: String(m.Remarks_Required).toLowerCase() === "true",
      }));
      setLocalRows(mapped);
    } catch (e) {
      setEditError(extractErrorMessage(e));
    }
  };

  const handleProcess = async (code: string) => {
    setEditError(null);
    try {
      let response: UpdateResponse | undefined;
      if (!allIssued) {
        response = await incIssue(code) as UpdateResponse;
      } else {
        response = await incPacking(code) as UpdateResponse;
      }

      if (response && response.issueStageCompleted) {
        setIsRedirecting(true);
        setUploadNotice("Issue stage complete! Returning to your dashboard...");
        setTimeout(() => {
          if (currentUser.role === "ADMIN") {
            router.push("/admin/dashboard");
          } else {
            sessionStorage.setItem("userDashboardView", "pick_pack");
            router.push("/user/dashboard");
          }
        }, 2500);
      } else {
        await refetch();
      }
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
    }
  };

  const mapApiToMaterialRow = (
    apiMaterial: { ID: number | string; Issue_stage?: number; Packing_stage?: number }, 
    oldRow: MaterialRow
  ): MaterialRow => {
    return {
      ...oldRow,
      id: Number(apiMaterial.ID),
      issueStage: apiMaterial.Issue_stage != null ? Number(apiMaterial.Issue_stage) : oldRow.issueStage,
      packingStage: apiMaterial.Packing_stage != null ? Number(apiMaterial.Packing_stage) : oldRow.packingStage,
    };
  };

  const handleUpdateIssueStage = async (code: string, stage: number, id: number) => {
    setEditError(null);
    try {
      const data = await updateIssueStage(orderId, code, stage, id) as UpdateResponse;
      const updatedMaterial = data?.updatedMaterial;
      if (!updatedMaterial) throw new Error("Invalid response.");

      const oldRow = localRows.find((r) => r.id === id);
      if (oldRow) {
        const updatedRow = mapApiToMaterialRow(updatedMaterial, oldRow);
        setLocalRows((prev) => prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)));
      }

      if (data?.issueStageCompleted) {
        setIsRedirecting(true);
        setUploadNotice("Issue stage complete! Returning to your dashboard...");
        setTimeout(() => {
          if (currentUser.role === "ADMIN") {
            router.push("/admin/dashboard");
          } else {
            sessionStorage.setItem("userDashboardView", "pick_pack");
            router.push("/user/dashboard");
          }
        }, 2500);
      }
      return oldRow!;
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
      await refetch();
      throw err;
    }
  };

  const handleUpdatePackingStage = async (code: string, stage: number, id: number) => {
    setEditError(null);
    try {
      const data = await updatePackingStage(orderId, code, stage, id) as UpdateResponse;
      const updatedMaterial = data?.updatedMaterial;
      if (!updatedMaterial) throw new Error("Invalid response.");

      const oldRow = localRows.find((r) => r.id === id);
      if (oldRow) {
        const updatedRow = mapApiToMaterialRow(updatedMaterial, oldRow);
        setLocalRows((prev) => prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)));
      }

      if (data?.packingStageCompleted) {
        setIsRedirecting(true);
        setUploadNotice("Packing stage complete! Returning to your dashboard...");
        setTimeout(() => {
          if (currentUser.role === "ADMIN") {
            router.push("/admin/dashboard");
          } else {
            sessionStorage.setItem("userDashboardView", "pick_pack");
            router.push("/user/dashboard");
          }
        }, 2500);
      }
      return oldRow!;
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
      await refetch();
      throw err;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {renderHeader()}
      <Container maxWidth={false} disableGutters sx={{ flexGrow: 1, py: 0, px: 0 }}>
        <Paper elevation={3} sx={{ borderRadius: 0, overflow: "hidden", borderTop: "1px solid #e0e0e0", borderBottom: "1px solid #e0e0e0" }}>
          <HeaderSection
            so={so}
            customerName={customerName}
            transferOrder={transferOrder}
            fgObd={fgObd}
            machineModel={machineModel}
            cncSerialNo={cncSerialNo}
            items={localRows}
          />
          <Divider />
          <Box sx={{ py: 3, px: 2, bgcolor: "background.paper" }}>
            {isOrderFullyComplete ? (
              <Alert severity="success" sx={{ borderRadius: 1, fontSize: "1rem", fontWeight: 500, boxShadow: 1, mx: 2 }}>
                This order is fully packed and complete. No further actions can be taken.
              </Alert>
            ) : (
              <InputBoxSection
                onSubmit={handleProcess}
                saleOrderNumber={so}
                onFileCreated={() => { setUploadNotice("File metadata saved"); refetch(); }}
                disabled={isOrderFullyComplete}
                items={localRows}
                uniqueGroups={uniqueGroups}
                selectedGroup={selectedGroup}
                onGroupChange={setSelectedGroup}
                onBulkAccept={handleBulkAccept}
                // [FIX] Pass calculated boolean to hide button if done
                showBulkButton={showBulkButton} 
                // [NEW] Pass toggle props to child
                showAll={showAll}
                onToggleShowAll={setShowAll}
              />
            )}
          </Box>
          <Divider />
          
          {/* [FIX] Removed the old FormControlLabel switch from here */}

          {editError && (
            <Alert severity="error" onClose={() => setEditError(null)} sx={{ borderRadius: 0, fontSize: "0.95rem", borderBottom: "1px solid #e0e0e0", px: 2, py: 1 }}>
              {editError}
            </Alert>
          )}
          <Box>
            <MaterialDataTable
              rows={displayedRows}
              loading={busy}
              onUpdateIssueStage={handleUpdateIssueStage}
              onUpdatePackingStage={handleUpdatePackingStage}
              onUpdateRemarks={handleUpdateRemarks}
              onProcessRowUpdateError={(err) => setEditError(extractErrorMessage(err))}
              isOrderFullyComplete={isOrderFullyComplete}
            />
          </Box>
        </Paper>
        <Snackbar open={!!uploadNotice} autoHideDuration={3000} onClose={() => setUploadNotice(null)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert severity="success" onClose={() => setUploadNotice(null)} sx={{ minWidth: 300, fontSize: "1rem", fontWeight: 500, boxShadow: 4 }}>
            {uploadNotice}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}