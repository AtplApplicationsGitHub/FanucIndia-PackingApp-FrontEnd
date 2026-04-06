"use client";
import { useSoArchive } from "../hooks/useSoArchive";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  IconButton,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  InputBase,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, Table, TableHead, // Added DialogActions, Select, MenuItem
  TableRow, TableCell, TableBody
} from "@mui/material";
import { Search, Print, Archive, Delete, Close, Visibility, Download } from "@mui/icons-material";
import axios from "axios";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { useRouter, useParams } from "next/navigation";
import AdminDashboardHeader from "@/app/admin/components/dashboard/Header";
import UserDashboardHeader from "@/app/user/components/Header";
import OrderSnapshot from "../components/OrderSnapshot";
import MaterialDetails from "../components/MaterialDetails";
import OrderStatusStepper from "../components/OrderStatusStepper";
import AttachmentDialogs from "../components/AttachmentDialogs";
import { secureDownload, secureView } from "@/common/lib/secure-download";
import SalesDashboardHeader from "@/app/sales/components/Header";
import { SalesDashboardView } from "@/app/sales/components/hooks/useSalesDashboard";
import { Theme } from "@mui/material/styles";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SoChatDrawer from "@/app/components/SoChatDrawer";
import { useSearchParams } from "next/navigation";
import { useTheme, alpha, TableContainer, Tooltip } from "@mui/material";
import { FilePresent } from "@mui/icons-material";
import CommonButton from "@/common/components/CommonButton";

interface SalesOrder {
  id: number;
  saleOrderNumber: string;
  status: string;
  deliveryDate: string;
  fgLocation?: string;
  transferOrder?: string;
  outboundDelivery?: string;
  paymentClearance?: boolean;
  priority?: string;
  product?: { name: string };
  customer?: { name: string; address?: string; contactNumber?: string | null; };
  packConfig?: { configName: string };
  transporter?: { name: string };
  plantCode?: { code: string };
  salesZone?: { name: string };
  customerNameText?: string | null;
  address?: string | null;
  specialRemarks?: string;
  attachments?: any[];
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
  Remarks?: string;
  Remarks_Required?: boolean;
}

interface VehicleAttachment {
  fileName: string;
  [key: string]: unknown;
}

interface VehicleEntry {
  id: number;
  attachments: VehicleAttachment[];
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

interface PaymentAttachment {
  id: number;
  fileName: string;
  saleOrderNumber: string;
  outboundDelivery: string;
  user: { name: string };
}
type UserRole = "ADMIN" | "SALES" | "USER" | null;

const isViewable = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ["pdf", "jpg", "jpeg", "png", "txt", "gif", "webp"].includes(
    ext || ""
  );
};

export default function SoSearchPage() {
  const [soNumber, setSoNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SoDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);

  const [multipleOrders, setMultipleOrders] = useState<{ saleOrderNumber: string, outboundDelivery: string }[] | null>(null);
  const [selectedObd, setSelectedObd] = useState<string>("");
  const [multipleDialogOpen, setMultipleDialogOpen] = useState(false);

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
  const [chatOpen, setChatOpen] = useState(false);

  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [vehicleAttachments, setVehicleAttachments] = useState<
    VehicleAttachment[]
  >([]);
  const [currentVehicleEntryId, setCurrentVehicleEntryId] = useState<
    number | null
  >(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAttachments, setPaymentAttachments] = useState<PaymentAttachment[]>([]);
  const [paymentAttachmentsLoading, setPaymentAttachmentsLoading] = useState(false);
  const [salesZone, setSalesZone] = useState("");
  const searchParams = useSearchParams();
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);
  useEffect(() => {
    if (searchParams.get("chat") === "1") {
      setChatOpen(true);
    }
  }, [searchParams]);

  const handleOpenVehicleAttachments = (entry: VehicleEntry) => {
    setVehicleAttachments(entry.attachments || []);
    setCurrentVehicleEntryId(entry.id);
    setVehicleDialogOpen(true);
  };

  const handleVehicleAttachmentAction = (
    entryId: number,
    fileName: string,
    action: "view" | "download"
  ) => {
    const isArchived = data?.isArchived;
    const url = isArchived
      ? API.SO_ARCHIVE.DOWNLOAD_VEHICLE_ATTACHMENT(entryId, fileName)
      : API.VEHICLE_ENTRY.DOWNLOAD_ATTACHMENT(entryId, fileName);

    const token = localStorage.getItem("token");

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.blob() : Promise.reject("Failed")))
      .then((blob) => {
        if (action === "view" && isViewable(fileName)) {
          secureView(blob);
        } else {
          secureDownload(blob, fileName);
        }
      });
  };

  // function to fetch payment attachments and open dialog
  const handleOpenPaymentAttachments = async () => {
    if (!data?.salesOrder?.id) return;

    setPaymentAttachmentsLoading(true);
    setPaymentDialogOpen(true);

    try {
      const res = await fetchWithAuth(
        API.SALES.ATTACHMENTS_BY_ORDER(data.salesOrder.id)
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const attachments = await res.json();
      setPaymentAttachments(attachments);

    } catch {
      setError("Failed to load payment attachments.");
      setPaymentDialogOpen(false);
    } finally {
      setPaymentAttachmentsLoading(false);
    }
  };
  // function to handle view/download of payment attachments
  const handlePaymentAttachmentAction = async (
    fileId: number,
    fileName: string,
    action: "view" | "download"
  ) => {
    try {
      const res = await fetchWithAuth(API.SALES.ATTACHMENT_DOWNLOAD(fileId));

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();

      if (action === "view" && isViewable(fileName)) {
        secureView(blob);
      } else {
        secureDownload(blob, fileName);
      }
    } catch {
      setError(`Failed to ${action} attachment.`);
    }
  };
  const buttonSx = {
    bgcolor: (theme: Theme) => theme.palette.action.hover, // Grey by default
    color: (theme: Theme) => theme.palette.text.primary, // Dark text
    borderRadius: 0,
    clipPath:
      "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
    fontWeight: 600,
    fontSize: 15,
    minWidth: 120,
    height: 40,
    px: 3,
    textTransform: "none" as const,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      bgcolor: (theme: Theme) => theme.palette.primary.main, // Fanuc Yellow on hover
      color: (theme: Theme) => theme.palette.primary.contrastText,
      boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
      "& .MuiSvgIcon-root, & svg": {
        color: "#000", // Icon turns black on hover
      },
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
      bgcolor: (theme: Theme) => theme.palette.action.hover,
      color: (theme: Theme) => theme.palette.text.disabled,
    },
  };

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
      setSalesZone(user.salesZone || "");
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const performSearch = useCallback(async (searchNumber: string, searchObd?: string) => {
    if (!searchNumber) return;
    setLoading(true);
    setError(null);
    setData(null);
    setMultipleOrders(null); // Reset multiple orders state
    try {
      const token = localStorage.getItem("token");

      let url = API.SO_SEARCH.BY_SO_NUMBER(searchNumber.trim());
      if (searchObd) {
        url += `?obd=${encodeURIComponent(searchObd.trim())}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // --- NEW MULTIPLE ORDERS CHECK ---
      if (res.data.multiple) {
        setMultipleOrders(res.data.orders);
        setSelectedObd(res.data.orders[0].outboundDelivery); // Default selection
        setMultipleDialogOpen(true);
      } else {
        setData(res.data);
      }
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
    const obdFromUrl = params.soNumber?.[1];

    if (soFromUrl) {
      const decodedSo = decodeURIComponent(soFromUrl);
      const decodedObd = obdFromUrl ? decodeURIComponent(obdFromUrl) : undefined;

      setSoNumber(decodedSo);
      performSearch(decodedSo, decodedObd);
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

  const handleAttachmentViewOrDownload = (
    fileId: number,
    action: "view" | "download",
    fileName?: string
  ) => {
    const fileObj = materialAttachments.find((f) => f.ID === fileId);
    const resolvedName =
      fileName || fileObj?.fileName || `attachment_${fileId}`;

    const url = data?.isArchived
      ? API.SO_ARCHIVE.DOWNLOAD_ATTACHMENT(fileId)
      : API.ERP_MATERIAL_FILES.BY_ID(fileId) + "/download";

    const token = localStorage.getItem("token");

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) return Promise.reject(`Failed to ${action} file`);
        return res.blob();
      })
      .then((blob) => {
        if (action === "view" && isViewable(resolvedName)) {
          secureView(blob);
        } else {
          secureDownload(blob, resolvedName);
        }
      })
      .catch((err) => setError(err.toString()));
  };

  const handleAttachmentView = (fileId: number) => {
    handleAttachmentViewOrDownload(fileId, "view");
  };

  const handleAttachmentDownload = (fileId: number) => {
    handleAttachmentViewOrDownload(fileId, "download");
  };

  const handleDispatchAttachmentAction = (
    dispatchId: number,
    fileName: string,
    action: "view" | "download"
  ) => {
    const isArchived = data?.isArchived;
    const url = isArchived
      ? API.SO_ARCHIVE.DOWNLOAD_DISPATCH_ATTACHMENT(dispatchId, fileName)
      : API.DISPATCH.ATTACHMENT(dispatchId, fileName);

    const token = localStorage.getItem("token");

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) =>
        res.ok ? res.blob() : Promise.reject("Failed to get attachment")
      )
      .then((blob) => {
        if (action === "view" && isViewable(fileName)) {
          secureView(blob);
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
          <SalesDashboardHeader
            userName={userName}
            view={"home"}
            salesZone={salesZone}
            setView={(view) => {
              const newView = view as SalesDashboardView;
              sessionStorage.setItem("salesDashboardView", newView);
              router.push("/sales/dashboard");
            }}
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
            <Paper
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleManualSearch();
              }}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: 400,
                border: "1px solid #e0e0e0",
              }}
            >
              <InputBase
                autoFocus
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search"
                inputProps={{ "aria-label": "search" }}
                value={soNumber}
                onChange={(e) => setSoNumber(e.target.value)}
              />
              <IconButton
                type="button"
                sx={{ p: "10px" }}
                aria-label="search"
                onClick={handleManualSearch}
                disabled={loading}
              >
                <Search />
              </IconButton>
            </Paper>

            {/* <Button
              variant="contained" // Keep contained to accept bgcolor sx override
              startIcon={<Search />}
              onClick={handleManualSearch}
              disabled={loading}
              sx={buttonSx}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "SUBMIT"
              )}
            </Button> */}

            {/* PRINT BUTTON */}
            {/* <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrint}
              sx={buttonSx}
            >
              PRINT
            </Button> */}

            {data && !data.isArchived && (
              <CommonButton
                variant="contained"
                startIcon={<ChatBubbleOutlineIcon />}
                onClick={() => setChatOpen(true)}

                disabled={!data?.salesOrder?.saleOrderNumber}
              >
                CHAT
              </CommonButton>
            )}

            <SoChatDrawer
              open={chatOpen}
              onClose={() => setChatOpen(false)}
              orderId={data?.salesOrder?.id || null}
              soNumber={data?.salesOrder?.saleOrderNumber || null}
              buttonSx={buttonSx}
            />

            {/* ARCHIVE / DELETE BUTTONS */}
            {userRole === "ADMIN" && data && (
              <>
                {data.salesOrder.status === "Dispatched" &&
                  !data.isArchived && (
                    <CommonButton
                      variant="contained"
                      startIcon={<Archive fontSize="small" />}
                      onClick={() =>
                        openConfirmation(
                          "archive",
                          data.salesOrder.saleOrderNumber
                        )
                      }
                      disabled={isActionLoading}
                    >
                      {isActionLoading && confirmAction === "archive" ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "ARCHIVE"
                      )}
                    </CommonButton>
                  )}
                {data.isArchived && (
                  <CommonButton
                    variant="contained"
                    startIcon={<Delete fontSize="small" />}
                    onClick={() =>
                      openConfirmation(
                        "delete",
                        data.salesOrder.saleOrderNumber
                      )
                    }
                    disabled={isActionLoading}
                  >
                    {isActionLoading && confirmAction === "delete" ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "DELETE"
                    )}
                  </CommonButton>
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
            <OrderStatusStepper
              status={data.salesOrder.status}
              stepsData={data.salesOrder.statusStepper}
            />
            <OrderSnapshot
              salesOrder={data.salesOrder}
              dispatchInfo={data.dispatchInfo}
              onViewPackingAttachments={handleOpenMaterialAttachments}
              onViewDispatchAttachments={handleOpenDispatchAttachments}
              onViewVehicleAttachments={handleOpenVehicleAttachments}
              onViewPaymentAttachments={handleOpenPaymentAttachments}
              hasPaymentAttachments={Array.isArray(data.salesOrder.attachments) && data.salesOrder.attachments.length > 0}
            />
            <MaterialDetails
              materialDetails={data.materialDetails}
              onViewAttachments={handleOpenMaterialAttachments}
            />
          </>
        )}
      </Box>
      {/* Payment Attachments Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: "secondary.main", fontWeight: 600, textAlign: "center" }}>
          PAYMENT ATTACHMENTS
          <IconButton
            onClick={() => setPaymentDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper}>
            <Table
              sx={{
                "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                  backgroundColor: lightYellow,
                },
                "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root": {
                  borderBottom: 0,
                },
              }}
            >
              <TableHead sx={{ bgcolor: "primary.main" }}>
                <TableRow>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>
                    SO Number
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>
                    Outbound Delivery
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>
                    File Name
                  </TableCell>
                  <TableCell align="center" sx={{ color: "primary.contrastText", fontWeight: "bold", width: "150px" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentAttachmentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : paymentAttachments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary" p={3}>
                        No attachments found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentAttachments.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>{file.saleOrderNumber}</TableCell>
                      <TableCell>{file.outboundDelivery}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{file.fileName}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handlePaymentAttachmentAction(file.id, file.fileName, "view")}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => handlePaymentAttachmentAction(file.id, file.fileName, "download")}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
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
        vehicleDialogOpen={vehicleDialogOpen}
        onVehicleDialogClose={() => setVehicleDialogOpen(false)}
        vehicleAttachments={vehicleAttachments}
        onVehicleAttachmentAction={handleVehicleAttachmentAction}
        currentVehicleEntryId={currentVehicleEntryId}
      />
      {/* Multiple Orders Dialog */}
      <Dialog open={multipleDialogOpen} onClose={() => setMultipleDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{
          color: "secondary.main", fontWeight: 700, fontSize: 20, textAlign: "center", py: 1.5, px: 2
        }}>
          MULTIPLE ORDERS FOUND
        </DialogTitle>
        <DialogContent dividers>
          <Typography mb={2} variant="body2" color="text.secondary">
            There are multiple Outbound Deliveries associated with SO <b>{soNumber}</b>. Please select the specific OBD to view:
          </Typography>
          <Select
            fullWidth
            size="small"
            value={selectedObd}
            onChange={(e) => setSelectedObd(e.target.value)}
          >
            {multipleOrders?.map((order, idx) => (
              <MenuItem key={idx} value={order.outboundDelivery}>
                {order.saleOrderNumber} - {order.outboundDelivery}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <CommonButton onClick={() => setMultipleDialogOpen(false)} color="inherit">Cancel</CommonButton>
          <CommonButton
            variant="contained"
            onClick={() => {
              setMultipleDialogOpen(false);
              // Pushing to URL triggers the useEffect which calls performSearch automatically
              router.push(`/so-search/${encodeURIComponent(soNumber)}/${encodeURIComponent(selectedObd)}`);
            }}
          >
            View Order
          </CommonButton>
        </DialogActions>
      </Dialog>
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
