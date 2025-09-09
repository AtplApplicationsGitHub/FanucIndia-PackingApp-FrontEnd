"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  AppBar,
  Tabs,
  Tab,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import {
  Search,
  Print,
  Home,
} from "@mui/icons-material";
import axios from "axios";
import { API, fetchWithAuth } from "@/common/lib/api";
import { useRouter, useParams } from "next/navigation";
import AdminDashboardHeader from "@/app/admin/components/dashboard/Header";
import UserDashboardHeader from "@/app/user/components/Header";
import { getGreeting } from "@/app/sales/components/utils/sales";
import LogoutButton from "@/common/components/LogoutButton";
import OrderSnapshot from "../components/OrderSnapshot";
import DispatchInfo from "../components/DispatchInfo";
import MaterialDetails from "../components/MaterialDetails";
import AttachmentDialogs from "../components/AttachmentDialogs";

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
  customer: { name: string; address: string };
  transporter?: { name: string };
  vehicleNumber: string;
  attachments?: { fileName: string }[];
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

interface SoDetails {
  salesOrder: SalesOrder;
  dispatchInfo: DispatchInfoData[];
  materialDetails: MaterialDetail[];
}
interface MaterialAttachment {
  ID: number;
  fileName: string;
  description: string | null;
}
type UserRole = "ADMIN" | "SALES" | "USER" | null;

// --- Sales Header Component ---
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
        <Button startIcon={<Home />} onClick={onNavigate}>
          Home
        </Button>
        <LogoutButton />
      </Box>
    </Box>
  </AppBar>
);

// --- Main Component ---
export default function SoSearchPage() {
  const [soNumber, setSoNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SoDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState(0);
  const snapshotRef = useRef<HTMLDivElement>(null);
  const dispatchRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<HTMLDivElement>(null);

  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [packingDrawerOpen, setPackingDrawerOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);

  const [dispatchAttachments, setDispatchAttachments] = useState<{ fileName: string }[]>([]);
  const [materialAttachments, setMaterialAttachments] = useState<MaterialAttachment[]>([]);

  const router = useRouter();
  const params = useParams<{ soNumber?: string[] }>();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<UserRole>(null);

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const refs = [snapshotRef, dispatchRef, materialRef];
    refs[newValue]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handlePrint = () => window.print();

  const handleOpenDispatchAttachments = () => {
    if (data?.dispatchInfo) {
      const allAttachments = data.dispatchInfo.flatMap(d => d.attachments || []);
      setDispatchAttachments(allAttachments);
      setDispatchDialogOpen(true);
    }
  };

  const handleOpenMaterialAttachments = async () => {
    if (!data?.salesOrder?.saleOrderNumber) return;
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

  const handleAttachmentView = (fileId: number) => {
    const url = API.ERP_MATERIAL_FILES.BY_ID(fileId) + "/download";
    const token = localStorage.getItem("token");

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.blob() : Promise.reject("Failed to fetch file"))
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      })
      .catch(() => setError("Failed to open attachment for viewing."));
  };

  const handleAttachmentDownload = (fileId: number) => {
    const url = API.ERP_MATERIAL_FILES.BY_ID(fileId) + "/download";
    const token = localStorage.getItem("token");

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.blob() : Promise.reject("Download failed"))
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `attachment_${fileId}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(() => setError("Failed to download attachment."));
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
      .then((res) => res.ok ? res.blob() : Promise.reject("Failed to get attachment"))
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        if (action === "view") {
          window.open(blobUrl, "_blank");
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        } else {
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(blobUrl);
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
            view={""}
            setView={(view) => {
              const newView = typeof view === "function" ? view("") : view;
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
              {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
            </Button>
            <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
              Print
            </Button>
          </Stack>
        </Box>
        {data && (
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{ bgcolor: "background.paper" }}
          >
            <Tab label="Order Snapshot" />
            <Tab label="Dispatch Info" />
            <Tab label="Material Details" />
          </Tabs>
        )}
      </Paper>

      <Box p={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!data && !loading && !error && !params.soNumber?.[0] && (
          <Typography sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}>
            Enter a Sales Order number to view details.
          </Typography>
        )}

        {data && (
          <>
            <Box ref={snapshotRef} sx={{ height: "24px" }} />
            <OrderSnapshot
              salesOrder={data.salesOrder}
              onViewPackingAttachments={() => setPackingDrawerOpen(true)}
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

        packingDrawerOpen={packingDrawerOpen}
        onPackingDrawerClose={() => setPackingDrawerOpen(false)}

        materialDialogOpen={materialDialogOpen}
        onMaterialDialogClose={() => setMaterialDialogOpen(false)}
        materialAttachments={materialAttachments}
        onMaterialAttachmentView={handleAttachmentView}
        onMaterialAttachmentDownload={handleAttachmentDownload}
      />
    </Box>
  );
}