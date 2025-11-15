"use client";
import { useSoArchive } from "../hooks/useSoArchive";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  AppBar,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import { Search, Print, } from "@mui/icons-material";
import {  BarChart3 } from "lucide-react";
import axios from "axios";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { useRouter, useParams } from "next/navigation";
import AdminDashboardHeader from "@/app/admin/components/dashboard/Header";
import UserDashboardHeader from "@/app/user/components/Header";
import { getGreeting } from "@/app/sales/components/utils/sales";
import LogoutButton from "@/common/components/LogoutButton";
import OrderSnapshot from "../components/OrderSnapshot";
import DispatchInfo from "../components/DispatchInfo";
import MaterialDetails from "../components/MaterialDetails";
import OrderStatusStepper from "../components/OrderStatusStepper";
import AttachmentDialogs from "../components/AttachmentDialogs";
import { secureDownload } from "@/common/lib/secure-download";

interface SalesOrder {
  saleOrderNumber: string;
  status: string;
  deliveryDate: string;
  fgLocation?: string;
  transferOrder?: string;
  outboundDelivery?: string;
  paymentClearance?: boolean;
  priority?: string;
  product?: { name: string };
  customer?: { name: string; address?: string };
  packConfig?: { configName: string };
  transporter?: { name: string };
  plantCode?: { code: string };
  salesZone?: { name: string };
  specialRemarks?: string;
}

interface DispatchInfoData {
  id: number;
  customer: { name: string; address: string } | null;
  customerName?: string;
  transporter?: { name: string } | null;
  transporterName?: string;
  vehicleNumber: string;
  attachments?: { fileName: string }[];
  address: string;
}

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

interface StatusStepperData {
  id: number;
  status: string;
  createdDateTime: string | null;
  updatedBy: string | null;
}

interface SoDetails {
  salesOrder: SalesOrder & { statusStepper: StatusStepperData[] };
  dispatchInfo: DispatchInfoData[];
  materialDetails: MaterialDetail[];
  isArchived: boolean;
  materialFiles?: MaterialAttachment[];
}

interface MaterialAttachment {
  ID: number;
  fileName: string;
  description: string | null;
}

type UserRole = "ADMIN" | "SALES" | "USER" | null;

const SalesHeader = ({
  userName,
  onNavigate,
}: {
  userName: string;
  onNavigate: () => void;
}) => (
  <AppBar
    position="static"
    color="default"
    sx={{ boxShadow: 2, bgcolor: "background.paper" }}
  >
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={2}
      px={{ xs: 2, md: 8 }}
    >
      <Typography variant="h6" fontWeight={600}>
        {getGreeting()},{" "}
        <Box component="span" color="primary.main">
          {userName}
        </Box>
      </Typography>
      <Box display="flex" alignItems="center" gap={2}>
        <Button startIcon={<BarChart3 />} onClick={onNavigate}>
         DASHBOARD
        </Button>
        <LogoutButton />
      </Box>
    </Box>
  </AppBar>
);

export default function SoSearchPage() {
  const [soNumber, setSoNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SoDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);

  const [dispatchAttachments, setDispatchAttachments] = useState<
    { fileName: string }[]
  >([]);
  const [materialAttachments, setMaterialAttachments] = useState<
    MaterialAttachment[]
  >([]);

  const router = useRouter();
  const params = useParams<{ soNumber?: string[] }>();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<UserRole>(null);

  const {
    isLoading: isActionLoading,
    confirmAction,
    handleArchive,
    handleDelete,
    openConfirmation,
    closeConfirmation,
    soNumberToProcess,
  } = useSoArchive(() => {
    setData(null);
    setSoNumber("");
    router.push("/so-search");
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      setUserName(user.name || "");
      setUserRole(user.role || null);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const performSearch = useCallback(async (searchNumber: string) => {
    if (!searchNumber) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        API.SO_SEARCH.BY_SO_NUMBER(searchNumber.trim()),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch SO details.");
      } else {
        setError("Failed to fetch SO details.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const soFromUrl = params.soNumber?.[0];
    if (soFromUrl) {
      const decodedSo = decodeURIComponent(soFromUrl);
      setSoNumber(decodedSo);
      performSearch(decodedSo);
    }
  }, [params.soNumber, performSearch]);

  const handleManualSearch = () => {
    const trimmedSo = soNumber.trim();
    if (trimmedSo) {
      router.push(`/so-search/${encodeURIComponent(trimmedSo)}`);
    } else {
      setError("Please enter a Sales Order number.");
    }
  };

  const handlePrint = () => window.print();

  const handleOpenDispatchAttachments = () => {
    if (data?.dispatchInfo) {
      const allAttachments = data.dispatchInfo.flatMap(
        (d) => d.attachments || []
      );
      setDispatchAttachments(allAttachments);
      setDispatchDialogOpen(true);
    }
  };

  const handleOpenMaterialAttachments = async () => {
    if (!data?.salesOrder?.saleOrderNumber) return;

    if (data.isArchived && data.materialFiles) {
      setMaterialAttachments(data.materialFiles);
      setMaterialDialogOpen(true);
      return;
    }

    try {
      const res = await fetchWithAuth(
        API.ERP_MATERIAL_FILES.BY_SO(data.salesOrder.saleOrderNumber)
      );
      if (!res.ok) throw new Error("Could not fetch attachments");
      const attachments = await res.json();
      setMaterialAttachments(attachments);
      setMaterialDialogOpen(true);
    } catch {
      setError("Failed to load material attachments.");
    }
  };

  const handleAttachmentViewOrDownload = (fileId: number, action: 'view' | 'download', fileName?: string) => {
    // If the data is archived, use the new archive endpoint; otherwise, use the old one.
    const url = data?.isArchived
      ? API.SO_ARCHIVE.DOWNLOAD_ATTACHMENT(fileId)
      : API.ERP_MATERIAL_FILES.BY_ID(fileId) + "/download";

    const token = localStorage.getItem("token");

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) return Promise.reject(`Failed to ${action} file`);
        return res.blob();
      })
      .then(blob => {
        if (action === 'view') {
          const blobUrl = window.URL.createObjectURL(blob);
          window.open(blobUrl, "_blank");
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        } else {
          // Find the correct filename from the state for download
          const file = materialAttachments.find(f => f.ID === fileId);
          secureDownload(blob, fileName || file?.fileName || `attachment_${fileId}`);
        }
      })
      .catch(err => setError(err.toString()));
  };

  const handleAttachmentView = (fileId: number) => {
    handleAttachmentViewOrDownload(fileId, 'view');
  };

  const handleAttachmentDownload = (fileId: number) => {
    handleAttachmentViewOrDownload(fileId, 'download');
  };

  const handleDispatchAttachmentAction = (
    dispatchId: number,
    fileName: string,
    action: "view" | "download"
  ) => {
    const url = API.DISPATCH.ATTACHMENT(dispatchId, fileName);
    const token = localStorage.getItem("token");

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) =>
        res.ok ? res.blob() : Promise.reject("Failed to get attachment")
      )
      .then((blob) => {
        if (action === "view") {
          const blobUrl = window.URL.createObjectURL(blob);
          window.open(blobUrl, "_blank");
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        } else {
          secureDownload(blob, fileName);
        }
      })
      .catch(() => setError(`Failed to ${action} attachment.`));
  };

  const renderHeader = () => {
    switch (userRole) {
      case "ADMIN":
        return (
          <AdminDashboardHeader
            userName={userName}
            view={"home"}
            setView={(view) => {
              const newView = typeof view === "function" ? view("home") : view;
              sessionStorage.setItem("adminView", newView);
              router.push("/admin/dashboard");
            }}
          />
        );
      case "USER":
        return (
          <UserDashboardHeader
            userName={userName}
            view={"home"}
            setView={(view) => {
              sessionStorage.setItem("userDashboardView", view);
              router.push("/user/dashboard");
            }}
          />
        );
      case "SALES":
        return (
          <SalesHeader
            userName={userName}
            onNavigate={() => router.push("/sales/dashboard")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      {renderHeader()}
      <Paper
        elevation={0}
        sx={{
          position: "static",
          top: userRole === "SALES" ? "72px" : "88px",
          left: 0,
          right: 0,
          zIndex: 1000,
          borderRadius: 0,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" p={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Sales Order Search"
              variant="outlined"
              size="small"
              value={soNumber}
              onChange={(e) => setSoNumber(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleManualSearch()}
              sx={{ width: 400, bgcolor: "background.paper" }}
            />
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleManualSearch}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Submit"
              )}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrint}
            >
              Print
            </Button>
            {userRole === 'ADMIN' && data && (
              <>
                {data.salesOrder.status === "Dispatched" && !data.isArchived && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                      openConfirmation("archive", data.salesOrder.saleOrderNumber)
                    }
                    disabled={isActionLoading}
                    size="small" 
                  >
                    {isActionLoading && confirmAction === "archive" ? (
                      <CircularProgress size={20} color="inherit" /> 
                    ) : (
                      "Archive"
                    )}
                  </Button>
                )}
                {data.isArchived && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() =>
                      openConfirmation("delete", data.salesOrder.saleOrderNumber)
                    }
                    disabled={isActionLoading}
                    size="small" 
                  >
                    {isActionLoading && confirmAction === "delete" ? (
                      <CircularProgress size={20} color="inherit" /> 
                    ) : (
                      "Delete"
                    )}
                  </Button>
                )}
              </>
            )}
          </Stack>
        </Box>
      </Paper>

      <Box p={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!data && !loading && !error && !params.soNumber?.[0] && (
          <Typography
            sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}
          >
            Enter a Sales Order number to view details.
          </Typography>
        )}

        {data && (
          <>
            {/* <Paper sx={{ p: 3, mb: 3 }} id="status-section"> */}
              <OrderStatusStepper status={data.salesOrder.status} stepsData={data.salesOrder.statusStepper} />
            {/* </Paper> */}
            <OrderSnapshot
              salesOrder={data.salesOrder}
              onViewPackingAttachments={handleOpenMaterialAttachments}
            />
            <DispatchInfo
              dispatchInfo={data.dispatchInfo}
              onViewAttachments={handleOpenDispatchAttachments}
            />
            <MaterialDetails
              materialDetails={data.materialDetails}
              onViewAttachments={handleOpenMaterialAttachments}
            />
          </>
        )}
      </Box>

      <AttachmentDialogs
        dispatchDialogOpen={dispatchDialogOpen}
        onDispatchDialogClose={() => setDispatchDialogOpen(false)}
        dispatchAttachments={dispatchAttachments}
        onDispatchAttachmentAction={handleDispatchAttachmentAction}
        dispatchInfo={data?.dispatchInfo || []}
        materialDialogOpen={materialDialogOpen}
        onMaterialDialogClose={() => setMaterialDialogOpen(false)}
        materialAttachments={materialAttachments}
        onMaterialAttachmentView={handleAttachmentView}
        onMaterialAttachmentDownload={handleAttachmentDownload}
      />
      {soNumberToProcess && (
        <>
          <ConfirmDeleteDialog
            open={confirmAction === "archive"}
            onCancel={closeConfirmation}
            onConfirm={handleArchive}
            title="Confirm Archive"
            description={`Are you sure you want to archive Sales Order ${soNumberToProcess}?`}
            loading={isActionLoading}
          />
          <ConfirmDeleteDialog
            open={confirmAction === "delete"}
            onCancel={closeConfirmation}
            onConfirm={handleDelete}
            title="Confirm Permanent Deletion"
            description={`Are you sure you want to permanently delete Sales Order ${soNumberToProcess}? This action cannot be undone.`}
            loading={isActionLoading}
          />
        </>
      )}
    </Box>
  );
}
