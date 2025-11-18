// hooks/usePaymentClearanceBarchart.ts
import { useEffect, useState } from "react";
import { API } from "@/common/lib/endpoints";
import { fetchWithAuth } from "@/common/lib/endpoints";

export type ZoneKey = "North" | "South" | "East" | "West" | string; // Allow extra zones like EZ, NZ-1 etc.

export interface ZonePaymentData {
  zone: ZoneKey;
  cleared: number;
  pending: number;
}

interface ApiResponseItem {
  zoneName: string;
  paymentCleared: number;
  paymentPending: number;
}

export const usePaymentClearanceBarchart = () => {
  const [data, setData] = useState<ZonePaymentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchWithAuth(API.DASHBOARD.ADMIN_PAYMENT_BY_ZONE);

        if (!response.ok) {
          throw new Error(`Failed to fetch payment clearance data: ${response.status}`);
        }

        const rawData: ApiResponseItem[] = await response.json();

        // Transform API response to match chart expectations
        const transformedData: ZonePaymentData[] = rawData.map(item => ({
          zone: item.zoneName,
          cleared: item.paymentCleared,
          pending: item.paymentPending,
        }));

        // Optional: Sort zones consistently (North → South → East → West → others)
        const zoneOrder: { [key: string]: number } = {
          North: 1,
          South: 2,
          East: 3,
          West: 4,
        };

        transformedData.sort((a, b) => {
          const aOrder = zoneOrder[a.zone] ?? 999;
          const bOrder = zoneOrder[b.zone] ?? 999;
          return aOrder - bOrder || a.zone.localeCompare(b.zone);
        });

        setData(transformedData);
      } catch (err) {
        console.error("Error fetching payment clearance by zone:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    return { data, loading, error };
};