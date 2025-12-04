"use client";

import { useState, useEffect, useMemo, SetStateAction } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, Backdrop, CircularProgress, Snackbar, Box, Container, Paper, Divider } from "@mui/material";
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
} from "@/common/services/erp.service";
import type { MaterialRow } from "@/app/admin/material-data/types/material-row";
import axios from "axios";

// --- Imports for Headers ---
import AdminDashboardHeader, { ViewType } from "@/app/admin/components/dashboard/Header";
import UserDashboardHeader from "@/app/user/components/Header";
import { UserDashboardView } from "@/app/user/hooks/useUserDashboard";
import SalesDashboardHeader from "@/app/sales/components/Header";
import { SalesDashboardView } from "@/app/sales/components/hooks/useSalesDashboard";

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
  const [, setIsRedirecting] = useState(false);
  
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
  const { data: header, error: hdrError } = useOrderHeader(orderId, currentUser.id);
  const {
    rows: fetchedRows = [],
    error: matError,
    loading: matLoading,
  } = useErpMaterials(orderId, currentUser.id);
  const {
    mutate: incIssue,
    loading: mutatingIssue,
  } = useIncrementIssueStage(orderId);

  const {
    mutate: incPacking,
    loading: mutatingPacking,
  } = useIncrementPackingStage(orderId);

  const mapApiToMaterialRow = (
    apiMaterial: ApiMaterial,
    oldRow: MaterialRow
  ): MaterialRow => {
    return {
      ...oldRow,
      id: Number(apiMaterial.ID),
      siNo: oldRow.siNo,
      materialCode: apiMaterial.Material_Code ?? oldRow.materialCode,
      materialDescription:
        apiMaterial.Material_Description ?? oldRow.materialDescription,
      batchNo: apiMaterial.Batch_No ?? oldRow.batchNo,
      soDonorBatch: apiMaterial.SO_Donor_Batch ?? oldRow.soDonorBatch,
      certNo: apiMaterial.Cert_No ?? oldRow.certNo,
      binNo: apiMaterial.Bin_No ?? oldRow.binNo,
      adf: apiMaterial.A_D_F ?? oldRow.adf,
      reqQuantity: Number(apiMaterial.Required_Qty) ?? oldRow.reqQuantity,
      issueStage: Number(apiMaterial.Issue_stage) ?? oldRow.issueStage,
      packingStage: Number(apiMaterial.Packing_stage) ?? oldRow.packingStage,
      machineModel: apiMaterial.Machine_Model ?? oldRow.machineModel,
      cncSerialNo: apiMaterial.CNC_Serial_No ?? oldRow.cncSerialNo,
    };
  };

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

  // --- Header Render Logic ---
  const renderHeader = () => {
    if (!currentUser.role) return null;

    const handleAdminNav = (view: SetStateAction<ViewType>) => {
      const newView = typeof view === 'function' ? (view as (prev: ViewType) => ViewType)('orders') : view;
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
          <UserDashboardHeader
            view={"pick_pack"}
            setView={handleUserNav}
          />
        );
      case "SALES":
        return (
          <SalesDashboardHeader
            view={"orders"}
            setView={handleSalesNav}
          />
        );
      default:
        return null;
    }
  };

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
      let response: { issueStageCompleted?: boolean } | undefined;
      if (!allIssued) {
        response = await incIssue(code);
      } else {
        await incPacking(code);
      }
      
      if (response && response.issueStageCompleted) {
        setIsRedirecting(true);
        setUploadNotice("Issue stage complete! Returning to your dashboard...");
        setTimeout(() => {
          if (currentUser.role === 'ADMIN') {
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

  const handleUpdateIssueStage = async (code: string, stage: number, id: number) => {
    setEditError(null);
    try {
      const data = await updateIssueStage(orderId, code, stage, id);
      const updatedMaterial = (data as { updatedMaterial?: ApiMaterial; issueStageCompleted?: boolean })?.updatedMaterial;
      if (!updatedMaterial) {
        throw new Error("Invalid response from server when updating issue stage.");
      }

      const oldRow = localRows.find((r) => r.id === id);
      if (!oldRow) throw new Error("Original row not found.");
      
      const updatedRow = mapApiToMaterialRow(updatedMaterial, oldRow);
      setLocalRows((prev) => prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)));

      if ((data as { issueStageCompleted?: boolean })?.issueStageCompleted) {
        setIsRedirecting(true);
        setUploadNotice("Issue stage complete! Returning to your dashboard...");
        setTimeout(() => {
          if (currentUser.role === 'ADMIN') {
            router.push("/admin/dashboard");
          } else {
            sessionStorage.setItem("userDashboardView", "pick_pack");
            router.push("/user/dashboard");
          }
        }, 2500);
      }
      
      return updatedRow;
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
      await refetch();
      throw err;
    }
  };

  const handleUpdatePackingStage = async (code: string, stage: number, id: number) => {
    setEditError(null);
    try {
      const data = await updatePackingStage(orderId, code, stage, id);
      const updatedMaterial = (data as { updatedMaterial?: ApiMaterial, packingStageCompleted?: boolean })?.updatedMaterial;
      if (!updatedMaterial) {
        throw new Error(
          "Invalid response from server when updating packing stage."
        );
      }
      const oldRow = localRows.find((r) => r.id === id);
      if (!oldRow) {
        throw new Error("Original row not found.");
      }
      const updatedRow = mapApiToMaterialRow(updatedMaterial, oldRow);

      setLocalRows((prev) =>
        prev.map((r) => (r.id === updatedRow.id ? updatedRow : r))
      );
      
      if ((data as { packingStageCompleted?: boolean })?.packingStageCompleted) {
        setIsRedirecting(true);
        setUploadNotice("Packing stage complete! Returning to your dashboard...");
        setTimeout(() => {
          if (currentUser.role === 'ADMIN') {
            router.push("/admin/dashboard");
          } else {
            sessionStorage.setItem("userDashboardView", "pick_pack");
            router.push("/user/dashboard");
          }
        }, 2500);
      }

      return updatedRow;
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err));
      await refetch(); 
      throw err;
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: '#f5f5f5' 
      }}
    >
      {/* Role-Specific Header */}
      {renderHeader()}

      {/* Main Content with NO GAPS */}
      <Container 
        maxWidth={false} 
        disableGutters 
        sx={{ 
          flexGrow: 1, 
          py: 0, // UPDATED: Set vertical padding to 0 to remove top gap
          px: 0 
        }}
      >
        {/* UNIFIED PAPER CONTAINER FOR HEADER, INPUT, AND TABLE */}
        <Paper 
          elevation={3}
          sx={{ 
            // mb: 3, // Removed margin-bottom if you want it flush at the bottom too, otherwise keep it
            borderRadius: 0, 
            overflow: 'hidden',
            borderTop: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          {/* 1. Header Section */}
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

          {/* 2. Input/Scan Section */}
          <Box sx={{ py: 3, px: 2, bgcolor: 'background.paper' }}>
            {isOrderFullyComplete ? (
              <Alert 
                severity="success" 
                sx={{ 
                  borderRadius: 1,
                  fontSize: '1rem',
                  fontWeight: 500,
                  boxShadow: 1,
                  mx: 2 
                }}
              >
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
                items={localRows}
              />
            )}
          </Box>

          <Divider />

          {editError && (
            <Alert 
              severity="error" 
              onClose={() => setEditError(null)}
              sx={{ 
                borderRadius: 0,
                fontSize: '0.95rem',
                borderBottom: '1px solid #e0e0e0',
                px: 2,
                py: 1
              }}
            >
              {editError}
            </Alert>
          )}

          {/* 3. Material Data Table */}
          <Box>
            <MaterialDataTable
              rows={localRows}
              loading={busy}
              onUpdateIssueStage={handleUpdateIssueStage}
              onUpdatePackingStage={handleUpdatePackingStage}
              onProcessRowUpdateError={(err) =>
                setEditError(extractErrorMessage(err))
              }
              isOrderFullyComplete={isOrderFullyComplete}
            />
          </Box>
        </Paper>

        {/* Success Snackbar */}
        <Snackbar
          open={!!uploadNotice}
          autoHideDuration={3000}
          onClose={() => setUploadNotice(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            severity="success" 
            onClose={() => setUploadNotice(null)}
            sx={{ 
              minWidth: 300,
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: 4
            }}
          >
            {uploadNotice}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}