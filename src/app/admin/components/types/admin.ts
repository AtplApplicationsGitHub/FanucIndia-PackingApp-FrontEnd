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
  assignedUser?: { id: number; name: string } | null; // Replaced terminal
  assignedUserId?: number; // Replaced terminalId
  customerId?: number;
  customer?: { id: number; name: string } | null;
  specialRemarks?: string | null;
  fgLocation?: string | null; 
};

export type Lookup = {
  products: { id: number; name: string }[];
  transporters: { id: number; name: string }[];
  plantCodes: { id: number; code: string }[];
  salesZones: { id: number; name: string }[];
  packConfigs: { id: number; configName: string }[];
  assignableUsers: { id: number; name: string }[]; // Replaced terminals
  customers: { id: number; name: string }[];
  [key: string]: LookupRow[];
};

export type LookupRow = {
  id: number;
  [key:string]: string | number | boolean | null | undefined;
};

export type MasterRow = {
  id: number;
  [key:string]: string | number | boolean | null | undefined;
};

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
  | "assignedUserId" // Replaced terminalId
  | "specialRemarks"
  | "fgLocation";

export type EditingCell = { id: number; field: EditableField } | null;

export type UserRole = "admin" | "sales" | "user";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string; 
  updatedAt: string; 
}
