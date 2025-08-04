const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fanuc.goval.app:3010";

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
    TERMINALS:       `${API_BASE_URL}/lookup/terminals`,
    TERMINAL_BY_ID: (id: string | number) => `${API_BASE_URL}/lookup/terminals/${id}`,
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
};

// --- Universal fetchWithAuth helper ---
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}

// --- API helpers using fetchWithAuth ---

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
