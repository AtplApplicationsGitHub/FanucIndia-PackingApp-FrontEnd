import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API } from "@/lib/api";

export const useSalesForm = (onSuccess: () => void) => {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (
    form: Record<string, unknown>,
    isEdit: boolean,
    id?: number
  ) => {
    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        ...form,
        productId: Number(form.productId),
        transporterId: Number(form.transporterId),
        plantCodeId: Number(form.plantCodeId),
        salesZoneId: Number(form.salesZoneId),
        packConfigId: Number(form.packConfigId),
        customerId: Number(form.customerId),
        paymentClearance:
          form.paymentClearance === "true" || form.paymentClearance === true,
      };

      // Get token before request
      const token = localStorage.getItem("token");

      if (isEdit && id) {
        await axios.put(API.SALES.EDIT_ORDER(id), payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("Sales entry updated.");
      } else {
        await axios.post(API.SALES.CREATE_ORDER, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("Sales entry created.");
      }

      onSuccess();
    } catch (error: unknown) {
      // Safe axios error handling
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data);
        toast.error("Something went wrong.");
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    handleSubmit,
    submitting,
    errors,
  };
};
