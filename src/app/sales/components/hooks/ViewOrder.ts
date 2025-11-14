// hooks/ViewOrder.ts
import { useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";

export interface MaterialAttachment {
  ID: number;
  fileName: string;
  description: string | null;
}

export interface SalesOrder {
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

export interface DispatchInfoData {
  id: number;
  customer: { name: string; address: string } | null;
  customerName?: string;
  transporter?: { name: string } | null;
  transporterName?: string;
  vehicleNumber: string;
  attachments?: { fileName: string }[];
  address: string;
}

export interface MaterialDetail {
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

export interface StatusStepperData {
  id: number;
  status: string;
  createdDateTime: string | null;
  updatedBy: string | null;
}

export interface SoDetails {
  salesOrder: SalesOrder & { statusStepper: StatusStepperData[] };
  dispatchInfo: DispatchInfoData[];
  materialDetails: MaterialDetail[];
  isArchived: boolean;
  materialFiles?: MaterialAttachment[];
}

export type ViewOrderResult = {
  data: SoDetails | null;
  loading: boolean;
  error: string | null;
  fetchOrder: (soNumber: string) => Promise<SoDetails>;
};

export function useViewOrder(): ViewOrderResult {
  const [data, setData] = useState<SoDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrder(soNumber: string): Promise<SoDetails> {
    setError(null);
    setData(null);

    const trimmed = soNumber.trim();
    if (!trimmed) {
      const errMsg = "SO number is required";
      setError(errMsg);
      throw new Error(errMsg);
    }

    const encoded = encodeURIComponent(trimmed);
    const url = API.SO_SEARCH.BY_SO_NUMBER(encoded);

    setLoading(true);

    try {
      const res = await fetchWithAuth(url);

      let errorMessage = `Server responded ${res.status} ${res.statusText}`;

      if (!res.ok) {
        let errorBody;
        try {
          errorBody = await res.json();
        } catch {
          errorBody = { message: await res.text() };
        }
        errorMessage = errorBody?.message || errorMessage;
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      const json: SoDetails = await res.json();
      setData(json);
      setError(null);
      return json;
    } catch (err: any) {
      const message = err?.message || "Network error. Please try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, fetchOrder };
}