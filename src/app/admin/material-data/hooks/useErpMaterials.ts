// // hooks/useErpMaterials.ts
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { getErpMaterials, incrementIssueStage } from '../../../../lib/api';
// import type { MaterialRow } from '../types/material-row';

// type ApiMaterial = {
//   ID: number;
//   Material_Code: string;
//   Material_Description: string;
//   Batch_No: string;
//   SO_Donor_Batch: string;
//   Cert_No: string;
//   Bin_No: string;
//   A_D_F: string;
//   Required_Qty: number;
//   Issue_stage: number;
//   Machine_Model: string;
//   CNC_Serial_No: string;
// };

// export function useErpMaterials(orderId: number) {
//   return useQuery<MaterialRow[], Error>({
//     queryKey: ['erpMaterials', orderId],
//     queryFn: async () => {
//       const data: ApiMaterial[] = await getErpMaterials(orderId);
//       return data.map((m, i) => ({
//         id: Number(m.ID),
//         siNo: i + 1,
//         materialCode: m.Material_Code,
//         materialDescription: m.Material_Description,
//         batchNo: m.Batch_No,
//         soDonorBatch: m.SO_Donor_Batch,
//         certNo: m.Cert_No,
//         binNo: m.Bin_No,
//         adf: m.A_D_F,
//         reqQuantity: m.Required_Qty,
//         issueStage: m.Issue_stage,
//         machineModel: m.Machine_Model,
//         cncSerialNo: m.CNC_Serial_No,
//       }));
//     },
//     enabled: orderId > 0,
//   });
// }

// export function useIncrementIssueStage(orderId: number) {
//   const queryClient = useQueryClient();
//   return useMutation<void, Error, string>({
//     mutationFn: (materialCode) =>
//       incrementIssueStage(orderId, materialCode),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['erpMaterials', orderId] });
//     },
//   });
// }


// hooks/useErpMaterials.ts
import { useState, useEffect, useCallback } from 'react';
import { getErpMaterials, incrementIssueStage } from '../../../../lib/api';
import type { MaterialRow } from '../types/material-row';

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
  Machine_Model: string;
  CNC_Serial_No: string;
};

export function useErpMaterials(orderId: number) {
  const [data, setData] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    if (orderId <= 0) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiData = await getErpMaterials(orderId);
      const mapped = (apiData as ApiMaterial[]).map((m, i) => ({
        id: Number(m.ID),
        siNo: i + 1,
        materialCode: m.Material_Code,
        materialDescription: m.Material_Description,
        batchNo: m.Batch_No,
        soDonorBatch: m.SO_Donor_Batch,
        certNo: m.Cert_No,
        binNo: m.Bin_No,
        adf: m.A_D_F,
        reqQuantity: m.Required_Qty,
        issueStage: m.Issue_stage,
        machineModel: m.Machine_Model,
        cncSerialNo: m.CNC_Serial_No,
      }));
      setData(mapped);
    } catch (err: any) {
      setError(err.message || 'Failed to load ERP materials');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return { data, loading, error, refetch: fetchMaterials };
}

export function useIncrementIssueStage(orderId: number) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (materialCode: string) => {
    setLoading(true);
    setError(null);
    try {
      await incrementIssueStage(orderId, materialCode);
    } catch (err: any) {
      setError(err.message || 'Failed to increment issue stage');
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
