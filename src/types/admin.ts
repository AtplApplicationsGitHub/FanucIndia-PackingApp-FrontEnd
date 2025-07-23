// src/types/admin.ts

export type SalesOrder = {
  id: number;
  user?: { name?: string } | null;
  userId?: string | number;
  product?: { name?: string } | null;
  productId?: number;
  saleOrderNumber?: string;
  outboundDelivery?: string;
  transferOrder?: string;
  deliveryDate?: string; // ISO date string
  transporter?: { name?: string } | null;
  transporterId?: number;
  plantCode?: { code?: string } | null;
  plantCodeId?: number;
  paymentClearance?: boolean;
  salesZone?: { name?: string } | null;
  salesZoneId?: number;
  packConfig?: { configName?: string } | null;
  packConfigId?: number;
  status?: string | null;
  priority?: number | null;
  terminal?: { name?: string } | null;
  terminalId?: number;
  customerId?: number;
  customer?: { id: number; name: string } | null;
  specialRemarks?: string | null;
};

export type Lookup = {
  products: { id: number; name: string }[];
  transporters: { id: number; name: string }[];
  plantCodes: { id: number; code: string }[];
  salesZones: { id: number; name: string }[];
  packConfigs: { id: number; configName: string }[];
  terminals: { id: number; name: string }[];
  customers: { id: number; name: string }[];
  [key: string]: { id: number; [k: string]: any }[];
};

// Used for master lookups; every row must have at least `id`
export type LookupRow = {
  id: number;
  [key: string]: string | number | boolean | null | undefined;
};

// Used for generic master tables
export type MasterRow = {
  id: number;
  [key: string]: string | number | boolean | null | undefined;
};

// Table cell edit
export type EditableField =
  | "productId"
  | "saleOrderNumber"
  | "outboundDelivery"
  | "transferOrder"
  | "deliveryDate"
  | "transporterId"
  | "plantCodeId"
  | "paymentClearance"
  | "salesZoneId"
  | "packConfigId"
  | "status"
  | "priority"
  | "terminalId"
  | "specialRemarks";

export type EditingCell = { id: number; field: EditableField } | null;

export type UserRole = "admin" | "sales" | "user";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}