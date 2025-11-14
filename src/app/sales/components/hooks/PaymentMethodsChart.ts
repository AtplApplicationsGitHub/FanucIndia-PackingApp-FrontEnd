// src/app/sales/components/salesdashboard/hooks/usePaymentClearance.ts
import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../../../common/lib/endpoints";
import { API } from "../../../../common/lib/endpoints";
import { PaymentClearanceItem } from "../types/sales";

interface UsePaymentClearanceResult {
  data: PaymentClearanceItem[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePaymentClearance(): UsePaymentClearanceResult {
  const [data, setData] = useState<PaymentClearanceItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithAuth(API.DASHBOARD.SALES_PAYMENT_CLEARANCE);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
      }

      const result: PaymentClearanceItem[] = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payment data");
      console.error("Payment clearance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}