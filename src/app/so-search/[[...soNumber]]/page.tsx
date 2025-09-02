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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Chip,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
} from "@mui/material";
import { StepIconProps } from "@mui/material/StepIcon";
import {
  Search,
  Print,
  Visibility,
  FilePresent,
  Close,
  Home,
  Check,
} from "@mui/icons-material";
import axios from "axios";
import { API, fetchWithAuth } from "@/common/lib/api";
import { useRouter, useParams } from "next/navigation";
import AdminDashboardHeader from "@/app/admin/components/dashboard/Header";
import UserDashboardHeader from "@/app/user/components/Header";
import { getGreeting } from "@/app/sales/components/utils/sales";
import LogoutButton from "@/common/components/LogoutButton";

// --- Types ---
interface SoDetails {
  salesOrder: any;
  dispatchInfo: any[];
  materialDetails: any[];
}
interface MaterialAttachment {
  ID: number;
  fileName: string;
  description: string | null;
}
type UserRole = "ADMIN" | "SALES" | "USER" | null;

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#784af4",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#784af4",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const QontoStepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
    ...(ownerState.active && {
      color: "#784af4",
    }),
    "& .QontoStepIcon-completedIcon": {
      color: "#784af4",
      zIndex: 1,
      fontSize: 18,
    },
    "& .QontoStepIcon-circle": {
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: "currentColor",
    },
  })
);

function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

const steps = [
  "Order Created",
  "Materials Issued",
  "Ready for Dispatch",
  "Dispatched",
];

function OrderStatusStepper({ status }: { status?: string }) {
  const getActiveStep = () => {
    if (!status) return 0;
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("dispatched")) return 3;
    if (lowerStatus === "f105") return 2; // Ready for Dispatch
    if (lowerStatus === "r105") return 1; // Materials Issued
    return 0; // Order Created
  };

  const activeStep = getActiveStep();

  return (
    <Stack sx={{ width: "100%", mb: 4 }} spacing={4}>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<QontoConnector />}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Stack>
  );
}

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

  const [dispatchDrawerOpen, setDispatchDrawerOpen] = useState(false);
  const [packingDrawerOpen, setPackingDrawerOpen] = useState(false);
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(false);

  const [drawerAttachments, setDrawerAttachments] = useState<any[]>([]);
  const [materialAttachments, setMaterialAttachments] = useState<
    MaterialAttachment[]
  >([]);

  const [materialFilters, setMaterialFilters] = useState({
    text: "",
    batch: "",
  });

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
    } catch (e) {
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch SO details.");
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const refs = [snapshotRef, dispatchRef, materialRef];
    refs[newValue]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handlePrint = () => window.print();

  const openDispatchAttachmentDrawer = (attachments: any[]) => {
    setDrawerAttachments(attachments);
    setDispatchDrawerOpen(true);
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
      setMaterialDrawerOpen(true);
    } catch (err) {
      setError("Failed to load material attachments.");
    }
  };

  const handleAttachmentView = (fileId: number) => {
    const url = API.ERP_MATERIAL_FILES.BY_ID(fileId) + "/download";
    const token = localStorage.getItem("token");

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch file for viewing");
        return res.blob();
      })
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
      .then((res) => {
        if (!res.ok) throw new Error("Download failed");
        return res.blob();
      })
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
      .then((res) => {
        if (!res.ok) throw new Error("Failed to get attachment");
        return res.blob();
      })
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

  const filteredMaterials =
    data?.materialDetails.filter((m) => {
      const textMatch =
        !materialFilters.text ||
        m.Material_Code?.toLowerCase().includes(
          materialFilters.text.toLowerCase()
        ) ||
        m.Material_Description?.toLowerCase().includes(
          materialFilters.text.toLowerCase()
        );
      const batchMatch =
        !materialFilters.batch ||
        m.Batch_No?.toLowerCase().includes(materialFilters.batch.toLowerCase());
      return textMatch && batchMatch;
    }) || [];

  const renderHeader = () => {
    switch (userRole) {
      case "ADMIN":
        return (
          <AdminDashboardHeader
            userName={userName}
            view={"" as any}
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
            view={"home" as any}
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
          <Typography
            sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}
          >
            Enter a Sales Order number to view details.
          </Typography>
        )}

        {data && (
          <>
            <Box ref={snapshotRef} sx={{ height: "24px" }} />

            <Paper ref={snapshotRef} sx={{ p: 3, mb: 3 }} id="snapshot-section">
              <OrderStatusStepper status={data.salesOrder.status} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h5" gutterBottom>
                  ORDER SNAPSHOT
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Chip
                    label={`Status: ${data.salesOrder.status}`}
                    color={
                      data.salesOrder.status === "Ready" ||
                      data.salesOrder.status === "Dispatched"
                        ? "success"
                        : "warning"
                    }
                  />
                  {data.salesOrder.priority && (
                    <Chip
                      label={`Priority: ${data.salesOrder.priority}`}
                      color="error"
                    />
                  )}
                </Box>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                <KVBox label="SO" value={data.salesOrder.saleOrderNumber} />
                <KVBox label="Status" value={data.salesOrder.status} />
                <KVBox
                  label="Delivery Date"
                  value={new Date(
                    data.salesOrder.deliveryDate
                  ).toLocaleDateString()}
                />
                <KVBox label="FG Location" value={data.salesOrder.fgLocation} />
              </Box>
              <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                <KVBox label="TO" value={data.salesOrder.transferOrder} />
                <KVBox label="OB" value={data.salesOrder.outboundDelivery} />
                <KVBox
                  label="Payment Status"
                  value={data.salesOrder.paymentClearance ? "Yes" : "No"}
                />
                <KVBox label="Packing Attachment">
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setPackingDrawerOpen(true)}
                  >
                    View attachments
                  </Link>
                </KVBox>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                <KVBox label="Product" value={data.salesOrder.product?.name} />
                <KVBox
                  label="Customer"
                  value={data.salesOrder.customer?.name}
                />
                <KVBox label="Priority" value={data.salesOrder.priority} />
                <KVBox label="Terminal" value={"-"} />
              </Box>
              <Box display="flex" flexWrap="wrap" gap={2}>
                <KVBox
                  label="Packing Config"
                  value={data.salesOrder.packConfig?.configName}
                />
                <KVBox
                  label="Transporter"
                  value={data.salesOrder.transporter?.name}
                />
                <KVBox
                  label="Delivery Plant Code"
                  value={data.salesOrder.plantCode?.code}
                />
                <KVBox
                  label="Sales Zone"
                  value={data.salesOrder.salesZone?.name}
                />
              </Box>
              <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                <KVBox
                  label="Special Remarks"
                  value={data.salesOrder.specialRemarks}
                  fullWidth
                />
              </Box>
            </Paper>

            <Paper ref={dispatchRef} sx={{ p: 3, mb: 3 }} id="dispatch-section">
              <Typography variant="h5" gutterBottom>
                DISPATCH INFO
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer Name</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Vehicle Number</TableCell>
                      <TableCell>Transporter</TableCell>
                      <TableCell>Attachments</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.dispatchInfo.map((dispatch) => (
                      <TableRow key={dispatch.id}>
                        <TableCell>{dispatch.customer.name}</TableCell>
                        <TableCell>{dispatch.customer.address}</TableCell>
                        <TableCell>{dispatch.vehicleNumber}</TableCell>
                        <TableCell>{dispatch.transporter?.name}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() =>
                              openDispatchAttachmentDrawer(
                                dispatch.attachments || []
                              )
                            }
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper ref={materialRef} sx={{ p: 3, mb: 3 }} id="material-section">
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h5">MATERIAL DETAILS</Typography>
                <Button onClick={handleOpenMaterialAttachments}>
                  Attachments
                </Button>
              </Box>
              <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                <TextField
                  size="small"
                  label="Search code/description"
                  value={materialFilters.text}
                  onChange={(e) =>
                    setMaterialFilters((p) => ({ ...p, text: e.target.value }))
                  }
                />
                <TextField
                  size="small"
                  label="Batch contains..."
                  value={materialFilters.batch}
                  onChange={(e) =>
                    setMaterialFilters((p) => ({ ...p, batch: e.target.value }))
                  }
                />
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Material Code</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Batch</TableCell>
                      <TableCell>SO Donor</TableCell>
                      <TableCell>Cert No</TableCell>
                      <TableCell>Bin</TableCell>
                      <TableCell>A/D/F</TableCell>
                      <TableCell>Req Qty</TableCell>
                      <TableCell>Issue</TableCell>
                      <TableCell>Packing</TableCell>
                      <TableCell>Updated By</TableCell>
                      <TableCell>Updated Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMaterials.map((m) => (
                      <TableRow key={m.ID}>
                        <TableCell>{m.Material_Code}</TableCell>
                        <TableCell>{m.Material_Description}</TableCell>
                        <TableCell>{m.Batch_No}</TableCell>
                        <TableCell>{m.SO_Donor_Batch}</TableCell>
                        <TableCell>{m.Cert_No}</TableCell>
                        <TableCell>{m.Bin_No}</TableCell>
                        <TableCell>{m.A_D_F}</TableCell>
                        <TableCell>{m.Required_Qty}</TableCell>
                        <TableCell>{m.Issue_stage}</TableCell>
                        <TableCell>{m.Packing_stage}</TableCell>
                        <TableCell>{m.UpdatedBy}</TableCell>
                        <TableCell>
                          {m.UpdatedDate
                            ? new Date(m.UpdatedDate).toLocaleString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>

      {/* Dispatch Attachment Drawer */}
      <Drawer
        anchor="right"
        open={dispatchDrawerOpen}
        onClose={() => setDispatchDrawerOpen(false)}
      >
        <Box sx={{ width: 450, p: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Dispatch Attachments</Typography>
            <IconButton onClick={() => setDispatchDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <List>
            {drawerAttachments.length === 0 ? (
              <ListItem>
                <ListItemText primary="No attachments found." />
              </ListItem>
            ) : (
              drawerAttachments.map((att, i) => (
                <ListItem
                  key={i}
                  secondaryAction={
                    <>
                      <Button
                        size="small"
                        onClick={() =>
                          handleDispatchAttachmentAction(
                            data!.dispatchInfo[0].id,
                            att.fileName,
                            "view"
                          )
                        }
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          handleDispatchAttachmentAction(
                            data!.dispatchInfo[0].id,
                            att.fileName,
                            "download"
                          )
                        }
                      >
                        Download
                      </Button>
                    </>
                  }
                >
                  <ListItemIcon>
                    <FilePresent />
                  </ListItemIcon>
                  <ListItemText primary={att.fileName} />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Drawer>

      {/* Packing Attachment Drawer (Dummy) */}
      <Drawer
        anchor="right"
        open={packingDrawerOpen}
        onClose={() => setPackingDrawerOpen(false)}
      >
        <Box sx={{ width: 400, p: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Packing Attachments</Typography>
            <IconButton onClick={() => setPackingDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <List>
            <ListItem>
              <ListItemText primary="Dummy packing attachment." />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Material Attachment Drawer */}
      <Drawer
        anchor="right"
        open={materialDrawerOpen}
        onClose={() => setMaterialDrawerOpen(false)}
      >
        <Box sx={{ width: 450, p: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Material Attachments</Typography>
            <IconButton onClick={() => setMaterialDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <List>
            {materialAttachments.length === 0 ? (
              <ListItem>
                <ListItemText primary="No attachments found." />
              </ListItem>
            ) : (
              materialAttachments.map((att) => (
                <ListItem
                  key={att.ID}
                  secondaryAction={
                    <>
                      <Button
                        size="small"
                        onClick={() => handleAttachmentView(att.ID)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleAttachmentDownload(att.ID)}
                      >
                        Download
                      </Button>
                    </>
                  }
                >
                  <ListItemIcon>
                    <FilePresent />
                  </ListItemIcon>
                  <ListItemText
                    primary={att.fileName}
                    secondary={att.description}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}

const KVBox = ({
  label,
  value,
  children,
  fullWidth = false,
}: {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
  fullWidth?: boolean;
}) => (
  <Box
    sx={{
      flex: fullWidth ? "1 1 100%" : "1 1 23%",
      minWidth: fullWidth ? "100%" : "200px",
      border: "1px dashed #e5e7eb",
      borderRadius: "10px",
      p: "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }}
  >
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: ".02em" }}
    >
      {label}
    </Typography>
    <Typography
      variant="body1"
      fontWeight={600}
      sx={{ whiteSpace: "pre-wrap" }}
    >
      {children || value || "—"}
    </Typography>
  </Box>
);
