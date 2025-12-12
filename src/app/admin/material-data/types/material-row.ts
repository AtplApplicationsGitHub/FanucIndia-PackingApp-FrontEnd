export interface MaterialRow {
  id: number;
  siNo: number;
  materialCode: string;
  materialDescription: string;
  batchNo: string;
  soDonorBatch: string;
  certNo: string;
  binNo: string;
  adf: string;
  reqQuantity: number;
  issueStage: number;
  packingStage: number;
  machineModel: string;
  cncSerialNo: string;
  updatedBy?: string;
  updatedDate?: string;
  group?: string;
  acceptBulkData?: boolean;
  mappingBarcode?: string;
  remarksRequired?: boolean;
  remarks?: string | null;
}