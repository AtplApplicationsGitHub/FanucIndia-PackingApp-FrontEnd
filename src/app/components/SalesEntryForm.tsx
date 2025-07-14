"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { API } from "@/lib/api";

export type SalesOrder = {
  id: number;
  productId: number;
  saleOrderNumber: string;
  outboundDelivery: string;
  transferOrder: string;
  deliveryDate: string;
  transporterId: number;
  plantCodeId: number;
  paymentClearance: boolean;
  salesZoneId: number;
  packConfigId: number;
  specialRemarks: string;
};

type LookupData = {
  products: { id: number; name: string }[];
  transporters: { id: number; name: string }[];
  plantCodes: { id: number; code: string }[];
  salesZones: { id: number; name: string }[];
  packConfigs: { id: number; configName: string }[];
};

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
  specialRemarks: "",
};

export const SalesEntryForm: React.FC<SalesEntryFormProps> = ({
  initialData,
  lookup,
  onSuccess,
}) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        productId:
          initialData.productId !== undefined && initialData.productId !== null
            ? String(initialData.productId)
            : "",
        saleOrderNumber: initialData.saleOrderNumber || "",
        outboundDelivery: initialData.outboundDelivery || "",
        transferOrder: initialData.transferOrder || "",
        deliveryDate: initialData.deliveryDate
          ? initialData.deliveryDate.split("T")[0]
          : "",
        transporterId:
          initialData.transporterId !== undefined &&
          initialData.transporterId !== null
            ? String(initialData.transporterId)
            : "",
        plantCodeId:
          initialData.plantCodeId !== undefined &&
          initialData.plantCodeId !== null
            ? String(initialData.plantCodeId)
            : "",
        paymentClearance:
          typeof initialData.paymentClearance === "boolean"
            ? String(initialData.paymentClearance)
            : "",
        salesZoneId:
          initialData.salesZoneId !== undefined &&
          initialData.salesZoneId !== null
            ? String(initialData.salesZoneId)
            : "",
        packConfigId:
          initialData.packConfigId !== undefined &&
          initialData.packConfigId !== null
            ? String(initialData.packConfigId)
            : "",
        specialRemarks: initialData.specialRemarks || "",
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.productId) newErrors.productId = "Required";
    if (!form.saleOrderNumber) newErrors.saleOrderNumber = "Required";
    if (!form.outboundDelivery) newErrors.outboundDelivery = "Required";
    if (!form.transferOrder) newErrors.transferOrder = "Required";
    if (!form.deliveryDate) newErrors.deliveryDate = "Required";
    if (!form.transporterId) newErrors.transporterId = "Required";
    if (!form.plantCodeId) newErrors.plantCodeId = "Required";
    if (!form.paymentClearance) newErrors.paymentClearance = "Required";
    if (!form.salesZoneId) newErrors.salesZoneId = "Required";
    if (!form.packConfigId) newErrors.packConfigId = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const payload = {
      productId: Number(form.productId),
      saleOrderNumber: form.saleOrderNumber,
      outboundDelivery: form.outboundDelivery,
      transferOrder: form.transferOrder,
      deliveryDate: new Date(form.deliveryDate).toISOString(),
      transporterId: Number(form.transporterId),
      plantCodeId: Number(form.plantCodeId),
      paymentClearance: form.paymentClearance === "true",
      salesZoneId: Number(form.salesZoneId),
      packConfigId: Number(form.packConfigId),
      specialRemarks: form.specialRemarks,
    };

    console.log("Payload being sent to backend:", payload);

    try {
      if (initialData && initialData.id) {
        await axios.put(API.SALES.CRUD_BY_ID(initialData.id), payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(API.SALES.CRUD, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSuccess();
    } catch (err: unknown) {
      let errorMsg = "Submission failed";
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        }
      }
      if (typeof errorMsg !== "string") {
        errorMsg = JSON.stringify(errorMsg, null, 2); // pretty print
      }
      setErrors({ submit: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  // CALENDAR
  const selectedDate = form.deliveryDate
    ? new Date(form.deliveryDate)
    : undefined;

  // SAFETY: Wait for lookups to load
  if (
    !lookup.products.length ||
    !lookup.transporters.length ||
    !lookup.plantCodes.length ||
    !lookup.salesZones.length ||
    !lookup.packConfigs.length
  ) {
    return (
      <div className="py-8 text-center text-lg text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      autoComplete="off"
    >
      {/* Product */}
      <div>
        <Label htmlFor="productId" className="text-zinc-800 dark:text-zinc-100">
          Product<span className="text-destructive">*</span>
        </Label>
        <select
          id="productId"
          name="productId"
          value={form.productId}
          onChange={(e) => handleSelectChange("productId", e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-md h-10 px-3"
          required
        >
          <option value="">Select product</option>
          {lookup.products.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.productId && (
          <p className="text-xs text-destructive dark:text-red-400">Required</p>
        )}
      </div>

      {/* Sales Order Number */}
      <div>
        <Label
          htmlFor="saleOrderNumber"
          className="text-zinc-800 dark:text-zinc-100"
        >
          Sales Order Number<span className="text-destructive">*</span>
        </Label>
        <Input
          id="saleOrderNumber"
          name="saleOrderNumber"
          value={form.saleOrderNumber}
          onChange={handleChange}
          className="bg-white dark:bg-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-700"
        />
        {errors.saleOrderNumber && (
          <p className="text-xs text-destructive dark:text-red-400">Required</p>
        )}
      </div>
      {/* Outbound Delivery */}
      <div>
        <Label
          htmlFor="outboundDelivery"
          className="text-zinc-800 dark:text-zinc-100"
        >
          Outbound Delivery<span className="text-destructive">*</span>
        </Label>
        <Input
          id="outboundDelivery"
          name="outboundDelivery"
          value={form.outboundDelivery}
          onChange={handleChange}
          className="bg-white dark:bg-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-700"
        />
        {errors.outboundDelivery && (
          <p className="text-xs text-destructive dark:text-red-400">Required</p>
        )}
      </div>
      {/* Transfer Order */}
      <div>
        <Label
          htmlFor="transferOrder"
          className="text-zinc-800 dark:text-zinc-100"
        >
          Transfer Order<span className="text-destructive">*</span>
        </Label>
        <Input
          id="transferOrder"
          name="transferOrder"
          value={form.transferOrder}
          onChange={handleChange}
          className="bg-white dark:bg-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-700"
        />
        {errors.transferOrder && (
          <p className="text-xs text-destructive dark:text-red-400">Required</p>
        )}
      </div>
      {/* Delivery Date */}
      <div>
        <Label
          htmlFor="deliveryDate"
          className="text-zinc-800 dark:text-zinc-100"
        >
          Required Date<span className="text-destructive">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left bg-white dark:bg-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-700"
              type="button"
            >
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span className="text-muted-foreground">Select date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-auto p-0 bg-white dark:bg-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-700"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setForm((prev) => ({
                    ...prev,
                    deliveryDate: format(date, "yyyy-MM-dd"),
                  }));
                  setErrors((prev) => ({ ...prev, deliveryDate: "" }));
                }
              }}
              initialFocus
              className="bg-white dark:bg-zinc-900 text-black dark:text-white"
            />
          </PopoverContent>
        </Popover>
        {errors.deliveryDate && (
          <p className="text-xs text-destructive dark:text-red-400">Required</p>
        )}
      </div>
      {/* Transporter */}
      <div>
        <Label
          htmlFor="transporterId"
          className="text-zinc-800 dark:text-zinc-100"
        >
          Transporter<span className="text-destructive">*</span>
        </Label>
        <select
          id="transporterId"
          name="transporterId"
          value={form.transporterId}
          onChange={(e) => handleSelectChange("transporterId", e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-md h-10 px-3"
          required
          disabled={!lookup.transporters.length}
        >
          <option value="">Select transporter</option>
          {lookup.transporters.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.name}
            </option>
          ))}
        </select>
        {errors.transporterId && (
          <p className="text-xs text-destructive dark:text-red-400">Required</p>
        )}
      </div>

      {/* Plant Code */}
      <div>
        <Label
          htmlFor="plantCodeId"
          className="text-zinc-800 dark:text-zinc-100"
        >
          Plant Code<span className="text-destructive">*</span>
        </Label>
        <select
          id="plantCodeId"
          name="plantCodeId"
          value={form.plantCodeId}
          onChange={(e) => handleSelectChange("plantCodeId", e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-md h-10 px-3"
          required
          disabled={!lookup.plantCodes.length}
        >
          <option value="">Select plant code</option>
          {lookup.plantCodes.map((pc) => (
            <option key={pc.id} value={String(pc.id)}>
              {pc.code}
            </option>
          ))}
        </select>
        {errors.plantCodeId && (
          <p className="text-xs text-destructive dark:text-red-400">Required</p>
        )}
      </div>
      {/* Payment Clearance */}
      <div>
        <Label className="text-zinc-800 dark:text-zinc-100">
          Payment Clearance<span className="text-destructive">*</span>
        </Label>
        <div className="flex space-x-6 mt-2">
          <label className="flex items-center space-x-2 text-zinc-700 dark:text-zinc-200">
            <input
              type="radio"
              name="paymentClearance"
              value="true"
              checked={form.paymentClearance === "true"}
              onChange={() => handleSelectChange("paymentClearance", "true")}
              className="accent-blue-600 dark:accent-blue-400"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2 text-zinc-700 dark:text-zinc-200">
            <input
              type="radio"
              name="paymentClearance"
              value="false"
              checked={form.paymentClearance === "false"}
              onChange={() => handleSelectChange("paymentClearance", "false")}
              className="accent-blue-600 dark:accent-blue-400"
            />
            <span>No</span>
          </label>
        </div>
        {errors.paymentClearance && (
          <p className="text-xs text-destructive dark:text-red-400">Required</p>
        )}
      </div>
      {/* Sales Zone */}
      <div>
        <Label
          htmlFor="salesZoneId"
          className="text-zinc-800 dark:text-zinc-100"
        >
          Sales Zone<span className="text-destructive">*</span>
        </Label>
        <select
          id="salesZoneId"
          name="salesZoneId"
          value={form.salesZoneId}
          onChange={(e) => handleSelectChange("salesZoneId", e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-md h-10 px-3"
          required
          disabled={!lookup.salesZones.length}
        >
          <option value="">Select sales zone</option>
          {lookup.salesZones.map((sz) => (
            <option key={sz.id} value={String(sz.id)}>
              {sz.name}
            </option>
          ))}
        </select>
        {errors.salesZoneId && (
          <p className="text-xs text-destructive dark:text-red-400">Required</p>
        )}
      </div>

      {/* Pack Configuration */}
      <div>
        <Label
          htmlFor="packConfigId"
          className="text-zinc-800 dark:text-zinc-100"
        >
          Pack Configuration<span className="text-destructive">*</span>
        </Label>
        <select
          id="packConfigId"
          name="packConfigId"
          value={form.packConfigId}
          onChange={(e) => handleSelectChange("packConfigId", e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-md h-10 px-3"
          required
          disabled={!lookup.packConfigs.length}
        >
          <option value="">Select config</option>
          {lookup.packConfigs.map((pc) => (
            <option key={pc.id} value={String(pc.id)}>
              {pc.configName}
            </option>
          ))}
        </select>
        {errors.packConfigId && (
          <p className="text-xs text-destructive dark:text-red-400">Required</p>
        )}
      </div>
      {/* Special Remarks */}
      <div className="md:col-span-2">
        <Label
          htmlFor="specialRemarks"
          className="text-zinc-800 dark:text-zinc-100"
        >
          Special Remarks
        </Label>
        <Textarea
          id="specialRemarks"
          name="specialRemarks"
          value={form.specialRemarks}
          onChange={handleChange}
          rows={3}
          className="bg-white dark:bg-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-700"
        />
      </div>
      {/* Submit Button */}
      <div className="md:col-span-2">
        <Button type="submit" disabled={submitting} className="w-full">
          {initialData ? "Update Order" : "Create Order"}
        </Button>
        {errors.submit && (
          <div className="text-xs text-destructive dark:text-red-400 mt-2">
            {typeof errors.submit === "string"
              ? errors.submit
              : JSON.stringify(errors.submit, null, 2)}
          </div>
        )}
      </div>
    </form>
  );
};
