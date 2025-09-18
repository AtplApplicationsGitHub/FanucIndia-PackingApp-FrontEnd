import type {
  MaterialFile,
  MaterialFileListResponse,
} from '@/app/admin/material-files/types/material-file';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const API = {
  LOOKUP: {
    PRODUCTS:        `${API_BASE_URL}/lookup/products`,
    PRODUCT_BY_ID:   (id: string | number) => `${API_BASE_URL}/lookup/products/${id}`,
    TRANSPORTERS:    `${API_BASE_URL}/lookup/transporters`,
    TRANSPORTER_BY_ID: (id: string | number) => `${API_BASE_URL}/lookup/transporters/${id}`,
    PLANT_CODES:     `${API_BASE_URL}/lookup/plant-codes`,
    PLANT_CODE_BY_ID: (id: string | number) => `${API_BASE_URL}/lookup/plant-codes/${id}`,
    SALES_ZONES:     `${API_BASE_URL}/lookup/sales-zones`,
    SALES_ZONE_BY_ID: (id: string | number) => `${API_BASE_URL}/lookup/sales-zones/${id}`,
    PACK_CONFIGS:    `${API_BASE_URL}/lookup/pack-configs`,
    PACK_CONFIG_BY_ID: (id: string | number) => `${API_BASE_URL}/lookup/pack-configs/${id}`,
    CUSTOMERS:       `${API_BASE_URL}/lookup/customers`,
    CUSTOMER_BY_ID: (id: string | number) => `${API_BASE_URL}/lookup/customers/${id}`,
    PRINTERS:       `${API_BASE_URL}/lookup/printers`,
    PRINTER_BY_ID: (id: string | number) => `${API_BASE_URL}/lookup/printers/${id}`,
  },
  ADMIN: {
    SALES_ORDERS:        `${API_BASE_URL}/admin/sales-orders`,
    SALES_ORDER_BY_ID:   (id: string | number) => `${API_BASE_URL}/admin/sales-orders/${id}`,
    ERP_MATERIALS_BY_ORDER: (orderId: number) => `${API_BASE_URL}/admin/orders/${orderId}/erp-materials`,
    INCREMENT_ISSUE_STAGE: (orderId: number) => `${API_BASE_URL}/admin/orders/${orderId}/erp-materials/increment-issue-stage`,
    UPDATE_ISSUE_STAGE: (orderId: number) => `${API_BASE_URL}/admin/orders/${orderId}/erp-materials/update-issue-stage`,
    INCREMENT_PACKING_STAGE: (orderId: number) => `${API_BASE_URL}/admin/orders/${orderId}/erp-materials/increment-packing-stage`,
    UPDATE_PACKING_STAGE: (orderId: number) => `${API_BASE_URL}/admin/orders/${orderId}/erp-materials/update-packing-stage`,
    USERS:               `${API_BASE_URL}/users`,
    USER_BY_ID:          (id: number) => `${API_BASE_URL}/users/${id}`,
  },
  SALES: {
    CREATE_ORDER:                `${API_BASE_URL}/sales-crud`,
    EDIT_ORDER:                  (id: string | number) => `${API_BASE_URL}/sales-crud/${id}`,
    TEMPLATE:                    `${API_BASE_URL}/sales-orders/template`,
    IMPORT:                      `${API_BASE_URL}/sales-orders/import`,
    DELETE_ORDER:                (id: string | number) => `${API_BASE_URL}/sales-crud/${id}`,
  },
  AUTH: {
    LOGIN:               `${API_BASE_URL}/auth/login`,
    SIGNUP:              `${API_BASE_URL}/auth/signup`,
    CHECK_EMAIL:         (email: string) =>
      `${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`,
  },
  USER_DASHBOARD: {
    ORDERS: `${API_BASE_URL}/user-dashboard/orders`,
  },
  SO_SEARCH: {
    BY_SO_NUMBER: (soNumber: string) => `${API_BASE_URL}/so-search/${soNumber}`,
  },
  DISPATCH: { 
    BASE: `${API_BASE_URL}/dispatch`,
    BY_ID: (id: number) => `${API_BASE_URL}/dispatch/${id}`,
    SO: (id: number) => `${API_BASE_URL}/dispatch/${id}/so`,
    DELETE_SO: (soId: number) => `${API_BASE_URL}/dispatch/so/${soId}`,
    PDF: (id: number) => `${API_BASE_URL}/dispatch/${id}/pdf`,
    ATTACHMENT: (id: number, fileName: string) => `${API_BASE_URL}/dispatch/${id}/attachments/${encodeURIComponent(fileName)}`,
  },
  ERP_MATERIAL_FILES: {
    BASE: `${API_BASE_URL}/v1/erp-material-files`,
    BY_ID: (id: number) => `${API_BASE_URL}/v1/erp-material-files/${id}`,
    BY_SO: (so: string) => `${API_BASE_URL}/v1/erp-material-files/by-sale-order/${encodeURIComponent(so)}`,
  },
  ERP_IMPORTER: {
    UPLOAD: `${API_BASE_URL}/erp-material-importer/upload`,
  },
  FG_DASHBOARD: `${API_BASE_URL}/fg-dashboard`,
};

export async function getMaterialFilesBySaleOrder(saleOrderNumber: string) {
  const res = await fetchWithAuth(API.ERP_MATERIAL_FILES.BY_SO(saleOrderNumber), { cache: 'no-cache' });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to load files by SO');
  return res.json() as Promise<MaterialFile[]>;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}

export async function getErpMaterials(orderId: number) {
  const url = API.ADMIN.ERP_MATERIALS_BY_ORDER(orderId);
  const res = await fetchWithAuth(url, { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ERP materials: ${res.statusText}`);
  }
  return res.json();
}

export async function incrementIssueStage(
  orderId: number,
  materialCode: string
) {
  const url = API.ADMIN.INCREMENT_ISSUE_STAGE(orderId);
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ materialCode }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to increment issue stage");
  }
  return res.json();
}

export async function updateIssueStage(
  orderId: number,
  materialCode: string,
  issueStage: number
) {
  const url = API.ADMIN.UPDATE_ISSUE_STAGE(orderId);
  const res = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ materialCode, issueStage }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update issue stage");
  }
  return res.json();
}

export async function incrementPackingStage(
  orderId: number,
  materialCode: string
) {
  const url = API.ADMIN.INCREMENT_PACKING_STAGE(orderId);
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ materialCode }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to increment packing stage");
  }
  return res.json();
}

export async function updatePackingStage(
  orderId: number,
  materialCode: string,
  packingStage: number
) {
  const url = API.ADMIN.UPDATE_PACKING_STAGE(orderId);
  const res = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ materialCode, packingStage }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update packing stage");
  }
  return res.json();
}

export type MaterialFileQuery = {
  search?: string;
  saleOrderNumber?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'fileName' | 'ID';
  sortOrder?: 'asc' | 'desc';
};

export type Paginated<T> = {
  items: T[];
  meta: { page: number; limit: number; total: number; pages: number };
};

// --- ERP Material Files: client ---
export async function getMaterialFiles(params: MaterialFileQuery) {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.saleOrderNumber) sp.set('saleOrderNumber', params.saleOrderNumber);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.sortBy) sp.set('sortBy', params.sortBy);
  if (params.sortOrder) sp.set('sortOrder', params.sortOrder);

  const res = await fetchWithAuth(
    `${API.ERP_MATERIAL_FILES.BASE}?${sp.toString()}`,
    { cache: 'no-cache' },
  );
  if (!res.ok) throw new Error((await res.text()) || 'Failed to load material files');
  return res.json() as Promise<Paginated<MaterialFileListResponse>>;
}

export async function getMaterialFileById(id: number) {
  const res = await fetchWithAuth(API.ERP_MATERIAL_FILES.BY_ID(id), { cache: 'no-cache' });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to load material file');
  return res.json() as Promise<MaterialFile>;
}

export type CreateMaterialFileInput = {
  saleOrderNumber?: string | null;
  fileName: string;
  description?: string | null;
};

export async function createMaterialFile(payload: CreateMaterialFileInput) {
  const res = await fetchWithAuth(API.ERP_MATERIAL_FILES.BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to create material file');
  return res.json() as Promise<MaterialFile>;
}

export async function updateMaterialFile(
  id: number,
  payload: Partial<CreateMaterialFileInput>,
) {
  const res = await fetchWithAuth(API.ERP_MATERIAL_FILES.BY_ID(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to update material file');
  return res.json() as Promise<MaterialFile>;
}

export async function deleteMaterialFile(id: number) {
  const res = await fetchWithAuth(API.ERP_MATERIAL_FILES.BY_ID(id), { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to delete material file');
  return res.json() as Promise<{ success: boolean }>;
}

// Rework the single-file helper to be a wrapper:
export async function uploadMaterialFile(
  file: File,
  saleOrderNumber?: string | null,
  description?: string,
) {
  return uploadMaterialFiles(saleOrderNumber ?? null, description ?? null, [file]);
}

export async function uploadMaterialFiles(
  saleOrderNumber: string | undefined | null,
  description: string | undefined | null,
  files: File[],
  signal?: AbortSignal,
) {
  if (!files.length) throw new Error('Please choose at least one file.');

  const fd = new FormData();
  if (saleOrderNumber) fd.append('saleOrderNumber', saleOrderNumber);
  if (description) fd.append('description', description);
  for (const f of files) fd.append('files', f, f.name); 

  const res = await fetchWithAuth(`${API.ERP_MATERIAL_FILES.BASE}/upload`, {
    method: 'POST',
    body: fd,
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Upload failed');
  }
  return res.json() as Promise<{ success: boolean; items: MaterialFile[] }>;
}
