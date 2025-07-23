"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSalesForm } from "@/hooks/useSalesForm";
import { SalesOrder, LookupData } from "@/types/sales";
import ProductSelect from "@/components/forms/SalesEntry/ProductSelect";
import TextInput from "@/components/forms/SalesEntry/TextInput";
import DeliveryDatePicker from "@/components/forms/SalesEntry/DeliveryDatePicker";
import TransporterSelect from "@/components/forms/SalesEntry/TransporterSelect";
import PlantCodeSelect from "@/components/forms/SalesEntry/PlantCodeSelect";
import SalesZoneSelect from "@/components/forms/SalesEntry/SalesZoneSelect";
import PackConfigSelect from "@/components/forms/SalesEntry/PackConfigSelect";
import PaymentClearanceToggle from "@/components/forms/SalesEntry/PaymentClearanceToggle";
import CustomerSelect from "@/components/forms/SalesEntry/CustomerSelect";
import RemarksTextarea from "@/components/forms/SalesEntry/RemarksTextarea";

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
  plantCodeId: "",
  paymentClearance: "",
  salesZoneId: "",
  packConfigId: "",
  customerId: "",
  specialRemarks: "",
};

const SalesEntryForm: React.FC<SalesEntryFormProps> = ({
  initialData,
  lookup,
  onSuccess,
}) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const { handleSubmit, submitting, errors } = useSalesForm(onSuccess);

  useEffect(() => {
    if (
      initialData &&
      lookup.products.length > 0 &&
      lookup.transporters.length > 0 &&
      lookup.plantCodes.length > 0 &&
      lookup.salesZones.length > 0 &&
      lookup.packConfigs.length > 0 &&
      lookup.customers.length > 0
    ) {
      setForm({
        productId: String(initialData.productId ?? ""),
        saleOrderNumber: initialData.saleOrderNumber ?? "",
        outboundDelivery: initialData.outboundDelivery ?? "",
        transferOrder: initialData.transferOrder ?? "",
        deliveryDate: initialData.deliveryDate ?? "",
        transporterId: String(initialData.transporterId ?? ""),
        plantCodeId: String(initialData.plantCodeId ?? ""),
        paymentClearance: String(initialData.paymentClearance),
        salesZoneId: String(initialData.salesZoneId ?? ""),
        packConfigId: String(initialData.packConfigId ?? ""),
        customerId: String(initialData.customerId ?? ""),
        specialRemarks: initialData.specialRemarks ?? "",
      });
    }
  }, [
    initialData,
    lookup.products,
    lookup.transporters,
    lookup.plantCodes,
    lookup.salesZones,
    lookup.packConfigs,
    lookup.customers,
  ]);

  const onChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(form, !!initialData, initialData?.id);
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProductSelect
          value={form.productId}
          onChange={onChange}
          options={lookup.products}
          error={errors.productId}
        />
        <TextInput
          label="Sale Order Number"
          name="saleOrderNumber"
          value={form.saleOrderNumber}
          onChange={onChange}
          error={errors.saleOrderNumber}
        />
        <TextInput
          label="Out Bound Delivery"
          name="outboundDelivery"
          value={form.outboundDelivery}
          onChange={onChange}
          error={errors.outboundDelivery}
        />
        <TextInput
          label="Transfer Order"
          name="transferOrder"
          value={form.transferOrder}
          onChange={onChange}
          error={errors.transferOrder}
        />
        <DeliveryDatePicker
          value={form.deliveryDate}
          onChange={onChange}
          error={errors.deliveryDate}
        />
        <TransporterSelect
          value={form.transporterId}
          onChange={onChange}
          options={lookup.transporters}
          error={errors.transporterId}
        />
        <PlantCodeSelect
          value={form.plantCodeId}
          onChange={onChange}
          options={lookup.plantCodes}
          error={errors.plantCodeId}
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
        />
        <PackConfigSelect
          value={form.packConfigId}
          onChange={onChange}
          options={lookup.packConfigs}
          error={errors.packConfigId}
        />
        <CustomerSelect
          value={form.customerId}
          onChange={onChange}
          options={lookup.customers}
          error={errors.customerId}
        />
        <RemarksTextarea
          value={form.specialRemarks}
          onChange={onChange}
          error={errors.specialRemarks}
        />
      </div>
      <div className="pt-6 flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default SalesEntryForm;
