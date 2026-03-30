import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { API } from "@/common/lib/endpoints";
import { SalesOrder, Lookup } from "@/app/admin/components/types/admin";
import SearchableSelect from "@/app/admin/components/dashboard/SearchableSelect";

type OptionItem = {
  id: string | number;
  name?: string;
  code?: string;
  configName?: string;
};
type FieldOption = keyof Lookup | OptionItem[];
type CustomerOption = Lookup["customers"][number];
type CustomerValue = CustomerOption | string | null;

function normalizeInputValue(val: unknown): string | number {
  if (val == null) return "";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "object") return "";
  return val as string | number;
}

type ErrorPayload = {
  message?: string | string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  order: SalesOrder;
  lookup: Lookup;
  onUpdate?: (updatedOrder: SalesOrder) => void;
};

const FIELDS: {
  key: keyof SalesOrder;
  label: string;
  type?: string;
  options?: FieldOption;
  disabled?: boolean;
  colSpan?: number;
  maxLength?: number;
}[] = [
  { key: "productId", label: "Product", type: "select", options: "products" },
  { key: "saleOrderNumber", label: "Sale Order Number" },
  { key: "outboundDelivery", label: "Out Bound Delivery" },
  { key: "transferOrder", label: "Transfer Order" },
  { key: "deliveryDate", label: "Required Date of Delivery", type: "date" },
  {
    key: "transporterId",
    label: "Transporter",
    type: "select",
    options: "transporters",
  },
  {
    key: "plantCode",
    label: "Delivery Plant Code",
  },
  {
    key: "paymentClearance",
    label: "Payment Clearance",
    type: "select",
    options: [
      { id: "true", name: "Yes" },
      { id: "false", name: "No" },
    ],
  },
  {
    key: "salesZoneId",
    label: "Sales Zone",
    type: "select",
    options: "salesZones",
  },
  {
    key: "packConfigId",
    label: "Packing Configuration",
    type: "select",
    options: "packConfigs",
  },
  {
    key: "customerId",
    label: "Customer",
    type: "select",
    options: "customers",
  },
  { key: "address", label: "Address" },
  { key: "priority", label: "Priority", type: "number" },
  // {
  //   key: "assignedUserId",
  //   label: "Assigned User",
  //   type: "select",
  //   options: "assignableUsers",
  // },
  {
  key: "issueUserId",
  label: "Issue Assigned User",
  type: "select",
  options: "assignableUsers",
},
{
  key: "packingUserId",
  label: "Pack Assigned User",
  type: "select",
  options: "assignableUsers",
},
  { key: "status", label: "Status", disabled: true },
  { key: "fgLocation", label: "FG Location" },
  { key: "specialRemarks", label: "Special Remarks" },
  { key: "additionalRemarks", label: "Additional Remarks" },
  { key: "labelRemarks", label: "Label Remarks", maxLength: 15 },
];

const PATCHABLE_KEYS = [
  "productId",
  "saleOrderNumber",
  "outboundDelivery",
  "transferOrder",
  "deliveryDate",
  "transporterId",
  // "plantCodeId",
  "plantCode",
  "paymentClearance",
  "salesZoneId",
  "packConfigId",
  "status",
  "priority",
  // "assignedUserId",
  "issueUserId",
  "packingUserId",
  "customerId",
  "customerNameText",
  "specialRemarks",
  "additionalRemarks",
  "labelRemarks",
  "fgLocation",
  "address",
] as const;

type SalesOrderPatch = Partial<
  Pick<SalesOrder, (typeof PATCHABLE_KEYS)[number]>
>;

export default function AdminOrderEditModal({
  open,
  onClose,
  order,
  lookup,
  onUpdate,
}: Props) {
  const [form, setForm] = useState<Partial<SalesOrder>>(() => ({
    ...order,
    // ✅ If ERP override exists, keep customerId empty so dropdown doesn't visually override it
    customerId: order.customerId,
    customerNameText: order.customerNameText ?? order.customer?.name ?? "",
    deliveryDate: order.deliveryDate
      ? dayjs(order.deliveryDate).toISOString()
      : "",
  }));
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (!open) return;
    setForm({
      ...order,
      customerId: order.customerId,
      customerNameText: order.customerNameText ?? order.customer?.name ?? "",
      deliveryDate: order.deliveryDate
        ? dayjs(order.deliveryDate).toISOString()
        : "",
    });
  }, [open, order]);

  const handleChange = (key: keyof SalesOrder, value: unknown) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };

      if (key === "customerId") {
        updated.customerNameText = "";
        const selectedCustomer = lookup.customers.find(
          (c) => String(c.id) === String(value),
        );

        if (selectedCustomer && typeof selectedCustomer.address === "string") {
          updated.address = selectedCustomer.address;
        }
      }

      if (key === "customerNameText") {
        updated.customerId = undefined;
      }

      return updated;
    });
  };

  const handleSave = async () => {
    if (
      form.saleOrderNumber &&
      String(form.saleOrderNumber).trim().length < 10
    ) {
      setSnackbar({
        open: true,
        message: "Sale Order Number must be at least 10 characters long.",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    const patch: SalesOrderPatch = {};

    for (const key of PATCHABLE_KEYS) {
      const v = form[key];

      switch (key) {
        case "productId":
        case "transporterId":
        // case "plantCodeId":
        case "salesZoneId":
        case "packConfigId":
          if (typeof v === "string" && v.trim() !== "") {
            patch[key] = Number(v) as SalesOrderPatch[typeof key];
          } else if (typeof v === "number") {
            patch[key] = v as SalesOrderPatch[typeof key];
          }
          break;

        case "issueUserId":
        case "packingUserId":
          if (typeof v === "string" && v.trim() !== "") {
            const backendKey = key === "issueUserId" ? "issueAssignedUserId" : "packingAssignedUserId";
            (patch as any)[backendKey] = Number(v); 
          } else if (typeof v === "number") {
            const backendKey = key === "issueUserId" ? "issueAssignedUserId" : "packingAssignedUserId";
            (patch as any)[backendKey] = v;
          }
          break;

        case "customerId":
          if (typeof v === "string" && v.trim() !== "") {
            patch[key] = Number(v) as SalesOrderPatch[typeof key];
          } else if (typeof v === "number") {
            patch[key] = v as SalesOrderPatch[typeof key];
          }
          break;

        case "customerNameText":
          if (typeof v === "string" && v.trim() !== "") {
            patch.customerNameText = v.trim();
          }
          break;

        case "priority":
          if (typeof v === "string" && v.trim() !== "") {
            patch.priority = Number(v);
          } else if (typeof v === "number") {
            patch.priority = v;
          } else if (v === null) {
            patch.priority = null;
          }
          break;

        case "paymentClearance":
          if (typeof v === "boolean") {
            patch.paymentClearance = v;
          } else if (typeof v === "string") {
            patch.paymentClearance = v === "true";
          }
          break;

        case "specialRemarks":
        case "status":
        case "fgLocation":
        case "additionalRemarks":
        case "labelRemarks":
        case "plantCode":
          if (typeof v === "string") {
            patch[key] = v as SalesOrderPatch[typeof key];
          } else if (v === null) {
            patch[key] = null as SalesOrderPatch[typeof key];
          }
          break;

        case "saleOrderNumber":
        case "outboundDelivery":
        case "transferOrder":
        case "deliveryDate":
          if (typeof v === "string") {
            patch[key] = v as SalesOrderPatch[typeof key];
          }
          break;

        case "address":
          if (typeof v === "string") {
            patch[key] = v as SalesOrderPatch[typeof key];
          }
          break;
      }
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(API.ADMIN.SALES_ORDER_BY_ID(order.id), patch, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate?.({ ...order, ...patch });
      setSnackbar({
        open: true,
        message: "Order updated!",
        severity: "success",
      });
      onClose();
    } catch (err: unknown) {
      console.error("Update error:", err);
      let errMsg = "Failed to update order.";

      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ErrorPayload;
        const msg = data.message;
        if (Array.isArray(msg)) {
          errMsg = msg.join("; ");
        } else if (typeof msg === "string") {
          errMsg = msg;
        }
      }
      setSnackbar({ open: true, message: errMsg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: (theme) => ({
            bgcolor: theme.palette.background.paper,
            borderRadius: 0,
            minHeight: "80vh",
            maxHeight: "95vh",
            overflow: "hidden",
          }),
        },
      }}
    >
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          bgcolor: theme.palette.background.paper,
          px: 3,
          py: 2,
        })}
      >
        <Box
          component="span"
          sx={(theme) => ({
            fontWeight: 700,
            fontSize: 22,
            flexGrow: 1,
            textAlign: "center",
            color: theme.palette.secondary.main,
            letterSpacing: 0,
          })}
        >
          EDIT ORDER
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: "absolute",
            right: 16,
            top: 10,
            color: theme.palette.text.primary,
          })}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent
        sx={(theme) => ({
          bgcolor: theme.palette.background.paper,
          p: { xs: 2, md: 3 },
          overflowY: "auto",
        })}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
            {FIELDS.map((field) => {
              const options: OptionItem[] =
                typeof field.options === "string"
                  ? lookup[field.options] || []
                  : Array.isArray(field.options)
                    ? field.options
                    : [];

              if (field.colSpan === 2) {
                return (
                  <Box key={field.key} sx={{ flex: "0 0 100%", mb: 1 }}>
                    <TextField
                      fullWidth
                      size="medium"
                      label={field.label}
                      value={normalizeInputValue(form[field.key])}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      disabled={loading}
                      multiline
                      minRows={2}
                      sx={(theme) => ({
                        bgcolor: theme.palette.background.default,
                        input: { color: theme.palette.text.primary },
                        label: { color: theme.palette.text.secondary },
                        borderRadius: 2,
                      })}
                    />
                  </Box>
                );
              }

              if (field.type === "date") {
                const raw = form[field.key];
                const dateObj =
                  typeof raw === "string" && dayjs(raw).isValid()
                    ? dayjs(raw)
                    : null;

                return (
                  <Box
                    key={field.key}
                    sx={{
                      flex: { xs: "1 1 100%", sm: "1 1 47%" },
                      minWidth: { xs: "100%", sm: "47%" },
                    }}
                  >
                    <DatePicker
                      label={field.label}
                      value={dateObj}
                      onChange={(newValue) => {
                        if (dayjs.isDayjs(newValue) && newValue.isValid()) {
                          handleChange(field.key, newValue.toISOString());
                        } else {
                          handleChange(field.key, "");
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "medium",
                          disabled: loading,
                          sx: (theme) => ({
                            bgcolor: theme.palette.background.default,
                            borderRadius: 2,
                            input: { color: theme.palette.text.primary },
                            label: { color: theme.palette.text.secondary },
                          }),
                        },
                      }}
                      format="DD-MMM-YYYY"
                    />
                  </Box>
                );
              }

              if (field.type === "select") {
                if (field.key === "customerId") {
                  const selected =
                    lookup.customers.find(
                      (c) =>
                        form.customerId != null &&
                        String(c.id) === String(form.customerId),
                    ) || null;

                  const value: CustomerValue =
                    selected ??
                    (form.customerNameText &&
                    String(form.customerNameText).trim() !== ""
                      ? String(form.customerNameText)
                      : null);
                  return (
                    <Box
                      key={field.key}
                      sx={{
                        flex: { xs: "1 1 100%", sm: "1 1 47%" },
                        minWidth: { xs: "100%", sm: "47%" },
                      }}
                    >
                      <Autocomplete
                        disablePortal
                        fullWidth
                        freeSolo
                        options={lookup.customers}
                        disabled={loading || !!order.hasMaterialData}
                        getOptionLabel={(option: CustomerOption | string) =>
                          typeof option === "string"
                            ? option
                            : (option?.name ?? "")
                        }
                        value={value}
                        isOptionEqualToValue={(
                          option: CustomerOption | string,
                          v: CustomerValue,
                        ) => {
                          if (typeof option === "string") {
                            return typeof v === "string"
                              ? option === v
                              : option === (v?.name ?? "");
                          }
                          if (typeof v === "string") return option.name === v;
                          return String(option.id) === String(v?.id);
                        }}
                        onChange={(_, newValue: CustomerValue) => {
                          if (typeof newValue === "string") {
                            handleChange("customerNameText", newValue);
                            handleChange("customerId", "");
                            return;
                          }

                          if (newValue && typeof newValue === "object") {
                            handleChange("customerId", String(newValue.id));
                            handleChange("customerNameText", "");
                            return;
                          }

                          handleChange("customerId", "");
                          handleChange("customerNameText", "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Customer Name"
                            placeholder="Select customer or type a new name"
                            size="medium"
                            disabled={loading || !!order.hasMaterialData}
                            sx={(theme) => ({
                              bgcolor: theme.palette.background.default,
                              borderRadius: 2,
                              input: { color: theme.palette.text.primary },
                              label: { color: theme.palette.text.secondary },
                            })}
                          />
                        )}
                      />
                    </Box>
                  );
                }

                const searchableOptions = options.map((opt) => ({
                  value: opt.id,
                  label: opt.name || opt.code || opt.configName || "",
                }));

                return (
                  <Box
                    key={field.key}
                    sx={{
                      flex: { xs: "1 1 100%", sm: "1 1 47%" },
                      minWidth: { xs: "100%", sm: "47%" },
                    }}
                  >
                    <SearchableSelect
                      name={field.key}
                      label={field.label}
                      options={searchableOptions}
                      value={normalizeInputValue(form[field.key])}
                      onChange={(value) => handleChange(field.key, value)}
                    />
                  </Box>
                );
              }

              return (
                <Box
                  key={field.key}
                  sx={{
                    flex: { xs: "1 1 100%", sm: "1 1 47%" },
                    minWidth: { xs: "100%", sm: "47%" },
                  }}
                >
                  <TextField
                    fullWidth
                    size="medium"
                    label={field.label}
                    type={field.type === "number" ? "number" : "text"}
                    value={normalizeInputValue(form[field.key])}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    disabled={
                      loading ||
                      field.disabled ||
                      (field.key === "address" && !!order.hasMaterialData)
                    }
                    inputProps={{ maxLength: field.maxLength }}
                    sx={(theme) => ({
                      bgcolor: theme.palette.background.default,
                      borderRadius: 2,
                      input: { color: theme.palette.text.primary },
                      label: { color: theme.palette.text.secondary },
                    })}
                  />
                </Box>
              );
            })}
          </Box>

          <DialogActions sx={{ mt: 2, px: 0 }}>
            <Button
              type="submit"
              disabled={loading}
              variant="text"
              sx={{
                color: "inherit",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                borderRadius: 0,
              }}
            >
              {loading ? <CircularProgress size={22} /> : "UPDATE"}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
