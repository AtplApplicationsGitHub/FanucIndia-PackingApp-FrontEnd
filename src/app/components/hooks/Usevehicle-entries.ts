import { useCallback, useEffect, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

export type VehicleEntryUser = {
  id?: number | string | null;
  name?: string | null;
  email?: string | null;
  userName?: string | null;
  username?: string | null;
  fullName?: string | null;
};

export type VehicleEntryAttachment = {
  path?: string | null;
  size?: number | null;
  fileName: string;
  description?: string | null;
  mimeType?: string | null;
  uploadedAt?: string | null;
};

export type VehicleEntry = {
  id: number | string;
  customerName?: string | null;
  vehicleNumber?: string | number | null;
  transporterName?: string | null;
  driverNumber?: string | number | null;
  driverName?: string | null;
  inTime?: string | null;
  outTime?: string | null;
  createdBy?: number | string | VehicleEntryUser | null;
  createdAt?: string | null;
  updatedBy?: string | VehicleEntryUser | null;
  updatedAt?: string | null;
  attachments?: VehicleEntryAttachment[] | null;
  createdUser?: VehicleEntryUser | null;
  dispatchStatus?: string | null;
  status?: string | null;
};

type VehicleEntryResponse =
  | VehicleEntry[]
  | {
      data?: VehicleEntry[];
      items?: VehicleEntry[];
      rows?: VehicleEntry[];
      records?: VehicleEntry[];
      vehicleEntries?: VehicleEntry[];
    };

const getRowsFromResponse = (payload: VehicleEntryResponse): VehicleEntry[] => {
  if (Array.isArray(payload)) return payload;

  return (
    payload.data ??
    payload.items ??
    payload.rows ??
    payload.records ??
    payload.vehicleEntries ??
    []
  );
};

export function useVehicleEntries(selectedDate?: string) {
  const [rows, setRows] = useState<VehicleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchVehicleEntries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchWithAuth(
        API.VEHICLE_ENTRY.LIST(
          selectedDate
            ? {
                startDate: selectedDate,
                endDate: selectedDate,
              }
            : undefined,
        ),
      );
      if (!response.ok) throw new Error("Failed to load vehicle entries");

      const payload = (await response.json()) as VehicleEntryResponse;
      setRows(getRowsFromResponse(payload));
    } catch {
      setRows([]);
      setError("Failed to load vehicle entries");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchVehicleEntries();
  }, [fetchVehicleEntries]);

  return {
    rows,
    loading,
    error,
    refetch: fetchVehicleEntries,
  };
}

export function useVehicleEntryAttachments() {
  const [attachments, setAttachments] = useState<VehicleEntryAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAttachments = useCallback(async (entryId: string | number) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchWithAuth(
        API.VEHICLE_ENTRY.GET_ATTACHMENTS(entryId),
      );
      if (!response.ok) throw new Error("Failed to load attachments");

      const payload = (await response.json()) as
        | VehicleEntryAttachment[]
        | { attachments?: VehicleEntryAttachment[] };
      setAttachments(Array.isArray(payload) ? payload : payload.attachments ?? []);
    } catch {
      setAttachments([]);
      setError("Failed to load attachments");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
    setError("");
  }, []);

  return {
    attachments,
    loading,
    error,
    fetchAttachments,
    clearAttachments,
  };
}
