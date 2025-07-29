import { useState, useEffect } from "react";
import { SalesOrder, Lookup } from "@/types/admin";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { API } from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

type OptionItem = {
  id: string | number;
  name?: string;
  code?: string;
  configName?: string;
};
type FieldOption = keyof Lookup | OptionItem[];

function normalizeInputValue(val: unknown): string | number {
  if (val == null) return "";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "object") return "";
  return val as string | number;
}

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
    key: "plantCodeId",
    label: "Delivery Plant Code",
    type: "select",
    options: "plantCodes",
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
  { key: "status", label: "Status" },
  { key: "specialRemarks", label: "Special Remarks", colSpan: 2 },
  { key: "priority", label: "Priority", type: "number" },
  {
    key: "terminalId",
    label: "Terminal",
    type: "select",
    options: "terminals",
  },
];

const PATCHABLE_KEYS = [
  "userId",
  "productId",
  "saleOrderNumber",
  "outboundDelivery",
  "transferOrder",
  "deliveryDate",
  "transporterId",
  "plantCodeId",
  "paymentClearance",
  "salesZoneId",
  "packConfigId",
  "status",
  "priority",
  "terminalId",
  "customerId",
  "specialRemarks",
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
    deliveryDate: order.deliveryDate
      ? dayjs(order.deliveryDate).toISOString()
      : "",
  }));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...order,
      deliveryDate: order.deliveryDate
        ? dayjs(order.deliveryDate).toISOString()
        : "",
    });
  }, [open, order]);

  const handleChange = (key: keyof SalesOrder, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);

    const patch: SalesOrderPatch = {};

    for (const key of PATCHABLE_KEYS) {
      const v = form[key];

      switch (key) {
        case "userId":
          if (typeof v === "string" && v.trim() !== "") {
            patch.userId = isNaN(Number(v)) ? v : Number(v);
          } else if (typeof v === "number") {
            patch.userId = v;
          }
          break;

        case "productId":
        case "transporterId":
        case "plantCodeId":
        case "salesZoneId":
        case "packConfigId":
        case "terminalId":
        case "customerId":
          if (typeof v === "string" && v.trim() !== "") {
            patch[key] = Number(v) as SalesOrderPatch[typeof key];
          } else if (typeof v === "number") {
            patch[key] = v as SalesOrderPatch[typeof key];
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
      }
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(API.ADMIN.SALES_ORDER_BY_ID(order.id), patch, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (typeof onUpdate === "function") {
        onUpdate({ ...order, ...patch });
      }
      toast.success("Order updated!");
      onClose();
    } catch (err) {
      let errMsg = "Failed to update order.";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        typeof (err as { response?: unknown }).response === "object"
      ) {
        const response = (
          err as { response?: { data?: { message?: string; error?: string } } }
        ).response;
        errMsg = response?.data?.message || response?.data?.error || errMsg;
      }
      console.error("Update error:", err);
      toast.error(errMsg);
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
      PaperProps={{
        sx: (theme) => ({
          bgcolor: theme.palette.background.paper, // Use theme for modal bg
          borderRadius: 0,
          minHeight: "80vh",
          maxHeight: "95vh",
          overflow: "hidden",
        }),
      }}
    >
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
            color: theme.palette.text.primary,
            letterSpacing: 0,
          })}
        >
          Edit Order
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
              if (field.key === "specialRemarks") {
                return (
                  <Box key={field.key} sx={{ flex: "0 0 100%", mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
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
                          size: "small",
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
                return (
                  <Box
                    key={field.key}
                    sx={{
                      flex: { xs: "1 1 100%", sm: "1 1 47%" },
                      minWidth: { xs: "100%", sm: "47%" },
                    }}
                  >
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={loading}
                      sx={(theme) => ({
                        bgcolor: theme.palette.background.default,
                        borderRadius: 2,
                      })}
                    >
                      <InputLabel
                        sx={(theme) => ({
                          color: theme.palette.text.secondary,
                        })}
                      >
                        {field.label}
                      </InputLabel>
                      <Select
                        value={normalizeInputValue(form[field.key])}
                        label={field.label}
                        onChange={(e) =>
                          handleChange(field.key, e.target.value)
                        }
                        MenuProps={{
                          PaperProps: {
                            sx: (theme) => ({
                              maxHeight: 300,
                              bgcolor: theme.palette.background.default,
                            }),
                          },
                        }}
                        sx={(theme) => ({
                          color: theme.palette.text.primary,
                        })}
                      >
                        <MenuItem value="">
                          <em>Select {field.label}</em>
                        </MenuItem>
                        {options.map((opt) => (
                          <MenuItem key={opt.id} value={opt.id}>
                            {opt.name || opt.code || opt.configName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                );
              }
              // text / number
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
                    size="small"
                    label={field.label}
                    type={field.type === "number" ? "number" : "text"}
                    value={normalizeInputValue(form[field.key])}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    disabled={loading}
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
