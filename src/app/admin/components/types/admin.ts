export type SalesOrder = {
  id: number;
  user?: { name?: string } | null;
  userId?: string | number;
  product?: { name?: string } | null;
  productId?: number;
  saleOrderNumber?: string;
  outboundDelivery?: string;
  transferOrder?: string;
  deliveryDate?: string; 
  transporter?: { name?: string } | null;
  transporterId?: number;
  plantCode?: string | null;
  paymentClearance?: boolean;
  salesZone?: { name?: string } | null;
  salesZoneId?: number;
  packConfig?: { configName?: string } | null;
  packConfigId?: number;
  status?: string | null;
  priority?: number | null;
  assignedUser?: { id: number; name: string } | null; 
  assignedUserId?: number;
  issueUser?: { id: number; name: string } | null;
  issueUserId?: number;
  packingUser?: { id: number; name: string } | null;
  packingUserId?: number;
  customerId?: number;
  customer?: { id: number; name: string } | null;
  customerNameText?: string | null;
  customerName?: string | null;
  specialRemarks?: string | null;
  additionalRemarks?: string | null;
  labelRemarks?: string | null;
  fgLocation?: string | null; 
  hasMaterialData?: boolean;
  skipIssueStage?: boolean;
  skipPackingStage?: boolean;
  address?: string | null;
  notificationCount?: number;
  materialData?: { A_D_F?: string | null }[];
  binCount?: number;
};

export type Lookup = {
  products: { id: number; name: string }[];
  transporters: { id: number; name: string }[];
  plantCodes: { id: number; code: string }[];
  salesZones: { id: number; name: string }[];
  packConfigs: { id: number; configName: string }[];
  assignableUsers: { id: number; name: string }[]; 
  customers: { id: number; name: string; address: string; contact?: string }[];
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
  | "assignedUserId" 
  | "specialRemarks"
  | "additionalRemarks"
  | "labelRemarks"
  | "fgLocation";

export type EditingCell = { id: number; field: EditableField } | null;

export type UserRole = "ADMIN" | "SALES" | "USER" | "";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string; 
  updatedAt: string;
  accessPickPack?: boolean;
  accessLabelPrint?: boolean;
  accessMaterialFgTransfer?: boolean;
  accessMaterialDispatch?: boolean;
  accessVehicleEntry?: boolean;
  accessLocationAccuracy?: boolean;
  accessContentAccuracy?: boolean;
  accessPutAway?: boolean;
  accessErpBarcode?: boolean;
}

export interface AdminKpisResponse {
  totalSoCount: number;
  totalSoCountPercentageChange: number;
  overdueSoCount: number;
  overdueSoCountPercentageChange: number;
  dispatchedSoCount: number;
  dispatchedSoCountPercentageChange: number;
}

export interface StatusCardData {
  title: string;
  value: string | number;
  percentage: string;
  isPositive: boolean;
  iconType: string;  
  iconColor: string;
}

export type AdminNewImportItem = {
  date: string;       
  dayLabel: string;   
  count: number;
};

export interface AdminStatusByCustomerDto {
  customerName: string;
  toBeIssuedCount: number;
  r105Count: number;
  w105Count: number;
  f105Count: number;
  dispatchedCount: number;
}

export interface AdminPaymentByCustomerDto {
  customerName: string;
  paymentCleared: number;
  paymentPending: number;
}

export interface AdminOverallStatusDto {
  totalOrders: number;
  toBeIssuedCount: number;
  r105Count: number;
  w105Count: number;
  f105Count: number;
  dispatchedCount: number;
}