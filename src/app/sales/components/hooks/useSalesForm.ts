import { useState } from "react";
import axios from "axios";
import { API } from "@/common/lib/endpoints";

export type AlertState = {
  severity: "success" | "error";
  message: string;
} | null;

export type SalesFormValues = {
  productId: string;
  saleOrderNumber: string;
  outboundDelivery: string;
  transferOrder: string;
  deliveryDate: string;
  transporterId: string;
  // plantCodeId: string;
  plantCode: string;
  paymentClearance: string | boolean;
  salesZoneId: string;
  packConfigId: string;
  customerId: string;
  customerName: string;
  specialRemarks: string;
  additionalRemarks?: string;
  labelRemarks?: string;
};

export const useSalesForm = (onSuccess?: () => void) => {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<AlertState>(null);

  const handleSubmit = async (
    form: SalesFormValues,
    isEdit: boolean,
    id?: number
  ) => {
    setAlert(null);

    const newErrors: Record<string, string> = {};

    if (!form.productId) {
      newErrors.productId = "Product is required";
    }
    if (!form.saleOrderNumber) {
      newErrors.saleOrderNumber = "Sale Order Number is required";
    } else if (String(form.saleOrderNumber).length < 10) {
      newErrors.saleOrderNumber = "Minimum 10 characters required";
    }
    if (!form.outboundDelivery) {
      newErrors.outboundDelivery = "Out Bound Delivery is required";
    }
    if (!form.transferOrder) {
      newErrors.transferOrder = "Transfer Order is required";
    }
    if (!form.deliveryDate) {
      newErrors.deliveryDate = "Delivery Date is required";
    }
    if (
      form.paymentClearance !== "true" &&
      form.paymentClearance !== "false" &&
      form.paymentClearance !== true &&
      form.paymentClearance !== false
    ) {
      newErrors.paymentClearance = "Please select payment clearance";
    }
    if (!form.transporterId) {
      newErrors.transporterId = "Transporter is required";
    }
    // if (!form.plantCodeId) {
    //   newErrors.plantCodeId = "Delivery Plant Code is required";
    // }
    if (!form.plantCode) {
      newErrors.plantCode = "Delivery Plant Code is required";
    }
    if (!form.salesZoneId) {
      newErrors.salesZoneId = "Sales Zone is required";
    }
    if (!form.packConfigId) {
      newErrors.packConfigId = "Packing Configuration is required";
    }
    const hasCustomerId =
      !!form.customerId && String(form.customerId).trim() !== "";
    const hasCustomerNameText =
      !!form.customerName && String(form.customerName).trim() !== "";

    if (!hasCustomerId && !hasCustomerNameText) {
      newErrors.customerId = "Customer is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const payload: Record<string, unknown> = {
        ...form,
        productId: Number(form.productId),
        transporterId: Number(form.transporterId),
        // plantCodeId: Number(form.plantCodeId),
        plantCode: form.plantCode,
        salesZoneId: Number(form.salesZoneId),
        packConfigId: Number(form.packConfigId),
        ...(hasCustomerId ? { customerId: Number(form.customerId) } : {}),
        ...(hasCustomerId
          ? { customerNameText: undefined }
          : { customerNameText: String(form.customerName || "").trim() }),
        paymentClearance:
          form.paymentClearance === "true" || form.paymentClearance === true,
      };

      if (!hasCustomerId) {
        delete payload.customerId;
      }

      if (!payload.customerNameText) {
        delete payload.customerNameText;
      }

      const token = localStorage.getItem("token");

      if (isEdit && id) {
        await axios.put(API.SALES.EDIT_ORDER(id), payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setAlert({ severity: "success", message: "Sales entry updated." });
        setTimeout(() => {
          onSuccess?.();
        }, 300);
      } else {
        await axios.post(API.SALES.CREATE_ORDER, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setAlert({ severity: "success", message: "Sales entry created." });
        setTimeout(() => {
          onSuccess?.(); 
        }, 300);
      }
    } catch (error: unknown) {
      let msg = "Something went wrong.";
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data);
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
        msg = error.response?.data?.message || msg;
      } else if (error instanceof Error) {
        msg = error.message;
      }
      setAlert({ severity: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    handleSubmit,
    submitting,
    errors,
    alert,
    clearAlert: () => setAlert(null),
  };
};
