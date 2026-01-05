export type SalesOrder = {
  id: number;
  productId: number;
  saleOrderNumber: string;
  outboundDelivery: string;
  transferOrder: string;
  deliveryDate: string;
  transporterId: number;
  plantCodeId: number;
  paymentClearance: boolean;
  salesZoneId: number;
  packConfigId: number;
  status?: string | null;
  specialRemarks: string;
  additionalRemarks?: string;
  labelRemarks?: string;
  hasMaterialData?: boolean;
  customerId?: number;
  customer?: { id?: number; name?: string; address?: string } | null;
  customerNameText?: string | null;
  customerName?: string;
  assignedUserId?: number | null;
  assignedUser?: {
    name: string;
  } | null;
};

export type LookupData = {
  products: { id: number; name: string }[];
  transporters: { id: number; name: string }[];
  plantCodes: { id: number; code: string }[];
  salesZones: { id: number; name: string }[];
  packConfigs: { id: number; configName: string }[];
  customers: { id: number; name: string }[];
};

export interface SalesKPIsResponse {
  totalSoCount: number;
  dispatchedSoCount: number;
  f105Count: number;
  statusDistribution: Record<string, number>; 
  
}

export interface SalesKpisResponse {
  totalSoCount: number;
  dispatchedSoCount: number;
  r105Count: number;
  w105Count: number;
  f105Count: number;
  toBeIssuedCount: number;
}

export interface SalesActivity {
  salesOrderNumber: string;
  status: string;
  activityTimestamp: string;
}

export interface PaymentClearanceItem {
  zoneName: string;
  paymentCleared: number;
  paymentPending: number;
}