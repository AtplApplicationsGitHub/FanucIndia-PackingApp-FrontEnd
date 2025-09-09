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