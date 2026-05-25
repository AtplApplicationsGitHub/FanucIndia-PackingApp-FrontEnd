"use client";

import { useEffect, useState } from "react";
import { useSalesForm } from "@/app/sales/components/hooks/useSalesForm";
import { SalesOrder, LookupData } from "@/app/sales/components/types/sales";
import ProductSelect from "@/app/sales/components/forms/ProductSelect";
import TextInput from "@/app/sales/components/forms/TextInput";
import DeliveryDatePicker from "@/app/sales/components/forms/DeliveryDatePicker";
import TransporterSelect from "@/app/sales/components/forms/TransporterSelect";
import SalesZoneSelect from "@/app/sales/components/forms/SalesZoneSelect";
import PackConfigSelect from "@/app/sales/components/forms/PackConfigSelect";
import PaymentClearanceToggle from "@/app/sales/components/forms/PaymentClearanceToggle";
import CustomerSelect from "@/app/sales/components/forms/CustomerSelect";
import RemarksTextarea from "@/app/sales/components/forms/RemarksTextarea";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

interface SalesEntryFormProps {
  initialData?: SalesOrder | null;
  lookup: LookupData;
  onSuccess: () => void;
}

const DEFAULT_FORM = {
  productId: "",
  saleOrderNumber: "",
  outboundDelivery: "",
  transferOrder: "",
  deliveryDate: "",
  transporterId: "",
  plantCode: "",
  paymentClearance: "",
  salesZoneId: "",
  packConfigId: "",
  customerId: "",
  customerName: "",
  specialRemarks: "",
  additionalRemarks: "",
  labelRemarks: "",
};

const SalesEntryForm: React.FC<SalesEntryFormProps> = ({
  initialData,
  lookup,
  onSuccess,
}) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const { handleSubmit, submitting, errors, alert, clearAlert } =
    useSalesForm();

  const isRestrictedMode =
    !!initialData &&
    initialData.status === "Dispatched";

  useEffect(() => {
    if (
      lookup.products.length > 0 &&
      lookup.transporters.length > 0 &&
      lookup.salesZones.length > 0 &&
      lookup.packConfigs.length > 0 &&
      lookup.customers.length > 0
    ) {
      if (initialData) {
        setForm({
          productId: String(initialData.productId ?? ""),
          saleOrderNumber: initialData.saleOrderNumber ?? "",
          outboundDelivery: initialData.outboundDelivery ?? "",
          transferOrder: initialData.transferOrder ?? "",
          deliveryDate: initialData.deliveryDate ?? "",
          transporterId: String(initialData.transporterId ?? ""),
          plantCode: initialData.plantCode ?? "",
          paymentClearance: String(initialData.paymentClearance),
          salesZoneId: String(initialData.salesZoneId ?? ""),
          packConfigId: String(initialData.packConfigId ?? ""),
          customerId: String(initialData.customerId ?? ""),
          customerName: initialData.customerId 
            ? "" 
            : (initialData.customerNameText ?? initialData.customer?.name ?? ""),
          specialRemarks: initialData.specialRemarks ?? "",
          additionalRemarks: initialData.additionalRemarks ?? "",
          labelRemarks: initialData.labelRemarks ?? "",
        });
      } else {
        if (lookup.salesZones.length === 1) {
          setForm((prev) => ({
            ...prev,
            salesZoneId: String(lookup.salesZones[0].id),
          }));
        }
      }
    }
  }, [
    initialData,
    lookup.products,
    lookup.transporters,
    lookup.salesZones,
    lookup.packConfigs,
    lookup.customers,
  ]);

  useEffect(() => {
    if (alert && alert.severity === "success") {
      const timer = setTimeout(() => {
        onSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [alert, onSuccess]);

  const onChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(form, !!initialData, initialData?.id);
  };

  return (
    <form id="sales-entry-form"  onSubmit={onSubmit} noValidate>
      {alert && (
        <Alert
          severity={alert.severity}
          onClose={clearAlert}
          sx={{ mb: 2, width: "100%" }}
        >
          {alert.message}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ProductSelect
          value={form.productId}
          onChange={onChange}
          options={lookup.products}
          error={errors.productId}
          disabled={isRestrictedMode}
        />
        <TextInput
          label="Sale Order Number"
          name="saleOrderNumber"
          value={form.saleOrderNumber}
          onChange={onChange}
          error={errors.saleOrderNumber}
          disabled={isRestrictedMode}
        />
        <TextInput
          label="Out Bound Delivery"
          name="outboundDelivery"
          value={form.outboundDelivery}
          onChange={onChange}
          error={errors.outboundDelivery}
          disabled={isRestrictedMode}
        />
        <TextInput
          label="Transfer Order"
          name="transferOrder"
          value={form.transferOrder}
          onChange={onChange}
          error={errors.transferOrder}
          disabled={isRestrictedMode}
          required={false}
        />
        <DeliveryDatePicker
          value={form.deliveryDate}
          onChange={onChange}
          error={errors.deliveryDate}
          disabled={isRestrictedMode}
        />
        <TransporterSelect
          value={form.transporterId}
          onChange={onChange}
          options={lookup.transporters}
          error={errors.transporterId}
          disabled={isRestrictedMode}
        />

        <TextInput
          label="Delivery Plant Code"
          name="plantCode"
          value={form.plantCode}
          onChange={onChange}
          error={errors.plantCode}
          disabled={isRestrictedMode}
          required={false}
        />

        <PaymentClearanceToggle
          value={form.paymentClearance}
          onChange={onChange}
          error={errors.paymentClearance}
        />

        <SalesZoneSelect
          value={form.salesZoneId}
          onChange={onChange}
          options={lookup.salesZones}
          error={errors.salesZoneId}
          disabled={isRestrictedMode}
        />
        <PackConfigSelect
          value={form.packConfigId}
          onChange={onChange}
          options={lookup.packConfigs}
          error={errors.packConfigId}
          disabled={isRestrictedMode}
          required={false}
        />
        <CustomerSelect
          valueId={form.customerId}
          valueName={form.customerName ?? ""}
          onChange={onChange}
          options={lookup.customers}
          error={errors.customerId || errors.customerName}
          disabled={!!initialData?.hasMaterialData || isRestrictedMode}
        />
        <div className="col-span-1">
          <RemarksTextarea
            value={form.specialRemarks}
            onChange={onChange}
            error={errors.specialRemarks}
            disabled={isRestrictedMode}
          />
        </div>
        <div className="col-span-1">
          <TextField
            fullWidth
            label="Additional Remarks"
            name="additionalRemarks"
            value={form.additionalRemarks}
            onChange={(e) => onChange("additionalRemarks", e.target.value)}
            placeholder="Enter additional remarks"
            multiline
            minRows={3}
            size="small"
            variant="outlined"
            autoComplete="off"
            disabled={isRestrictedMode}
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px",
                backgroundColor: (theme) => theme.palette.background.paper,
              },
              "& .MuiInputLabel-root": { fontWeight: 500, fontSize: 15 },
            }}
          />
        </div>
        <div className="col-span-1">
          <TextField
            fullWidth
            label="Label Remarks"
            name="labelRemarks"
            value={form.labelRemarks}
            onChange={(e) => onChange("labelRemarks", e.target.value)}
            placeholder="Enter label remarks"
            multiline
            minRows={3}
            size="small"
            variant="outlined"
            autoComplete="off"
            disabled={isRestrictedMode}
            inputProps={{ maxLength: 15 }}
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px",
                backgroundColor: (theme) => theme.palette.background.paper,
              },
              "& .MuiInputLabel-root": { fontWeight: 500, fontSize: 15 },
            }}
          />
        </div>
      </div>
    </form>
  );
};

export default SalesEntryForm;
