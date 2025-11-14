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
  customerId: number;
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


// types/sales.ts
export interface SalesKPIsResponse {
  totalSoCount: number;
  dispatchedSoCount: number;
  f105Count: number;
  statusDistribution: Record<string, number>; // e.g., { "Pending": 5, "Dispatched": 8, ... }
  
}

export interface SalesKpisResponse {
  totalSoCount: number;
  dispatchedSoCount: number;
  r105Count: number;
  w105Count: number;
  f105Count: number;
}


// types/sales.ts
export interface SalesActivity {
  salesOrderNumber: string;
  status: string;
  activityTimestamp: string; // ISO string
}


export interface PaymentClearanceItem {
  zoneName: string;
  paymentCleared: number;
  paymentPending: number;
}