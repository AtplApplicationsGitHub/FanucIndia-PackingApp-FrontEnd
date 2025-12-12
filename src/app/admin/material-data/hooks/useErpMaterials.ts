import { useState, useEffect, useCallback } from 'react';
import { getErpMaterials, incrementIssueStage, updateIssueStage, incrementPackingStage, updatePackingStage } from '@/common/services/erp.service';
import type { MaterialRow } from '@/app/admin/material-data/types/material-row';

type ApiMaterial = {
  ID: number;
  Material_Code: string;
  Material_Description: string;
  Batch_No: string;
  SO_Donor_Batch: string;
  Cert_No: string;
  Bin_No: string;
  A_D_F: string;
  Required_Qty: number;
  Issue_stage: number;
  Packing_stage: number;
  Machine_Model: string;
  CNC_Serial_No: string;
  UpdatedBy?: string;
  UpdatedDate?: string;
  Group?: string;
  Accept_Bulk_Data?: boolean | string; 
  Mapping_Barcode?: string;
  Remarks_Required?: boolean | string;
  Remarks?: string | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Something went wrong';
}

/** Fetch ERP materials for a given order. */
export function useErpMaterials(orderId: number, userId: number | null) {
  const [rows, setRows] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getErpMaterials(orderId);
        if (cancelled) return;

        const apiRows = (Array.isArray(data?.items) ? data.items : data) as ApiMaterial[];

        const mapped: MaterialRow[] = apiRows.map((m, idx) => ({
          id: Number(m.ID),
          siNo: idx + 1,
          materialCode: m.Material_Code,
          materialDescription: m.Material_Description,
          batchNo: m.Batch_No,
          soDonorBatch: m.SO_Donor_Batch,
          certNo: m.Cert_No,
          binNo: m.Bin_No,
          adf: m.A_D_F,
          reqQuantity: m.Required_Qty,
          issueStage: m.Issue_stage,
          packingStage: m.Packing_stage ?? 0,
          machineModel: m.Machine_Model,
          cncSerialNo: m.CNC_Serial_No,
          updatedBy: m.UpdatedBy,
          updatedDate: m.UpdatedDate,
          group: m.Group || "", 
          mappingBarcode: m.Mapping_Barcode || "",
          acceptBulkData: String(m.Accept_Bulk_Data).toLowerCase() === 'true',
          remarksRequired: String(m.Remarks_Required).toLowerCase() === 'true',
          remarks: m.Remarks || null,
        }));

        setRows(mapped);
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [orderId, userId]);

  return { rows, setRows, loading, error, setError };
}

/** Scan → increment ISSUE stage */
export function useIncrementIssueStage(orderId: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (materialCode: string) => {
    setLoading(true);
    setError(null);
    try {
      return await incrementIssueStage(orderId, materialCode);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  return { mutate, loading, error, setError };
}

/** Scan → increment PACKING stage */
export function useIncrementPackingStage(orderId: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (materialCode: string) => {
    setLoading(true);
    setError(null);
    try {
      return await incrementPackingStage(orderId, materialCode);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  return { mutate, loading, error, setError };
}

/** Inline edit ISSUE stage */
export function useUpdateIssueStage(orderId: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (materialCode: string, value: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateIssueStage(orderId, materialCode, value);
      return res;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  return { mutate, loading, error, setError };
}

/** Inline edit PACKING stage */
export function useUpdatePackingStage(orderId: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (materialCode: string, value: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updatePackingStage(orderId, materialCode, value);
      return res;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  return { mutate, loading, error, setError };
}