export type IbdUpload = {
  id: number;
  fileName: string;
  uploadedById: number;
  uploadedByName: string;
  uploadedAt: string;
  rowCount: number;
};

export type IbdRow = {
  id: number;
  uploadId: number;
  rowNumber: number;
  inboundDelivery: string | null;
  materialNumber: string | null;
  materialDescription: string | null;
  customerName: string | null;
  customerM: string | null;
  filPurchase: string | null;
  fjOaNumber: string | null;
  fjInvoice: string | null;
  invoiceDate: string | null;
  caseNumber: string | null;
  filSoNumber: string | null;
  weightKg: string | null;
};

export type IbdListParams = {
  page: number;
  limit: number;
  search: string;
};

export type IbdRowsParams = {
  page: number;
  limit: number;
  search: string;
};

export type IbdPrinter = {
  id: number;
  name: string;
};
