const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fanuc.goval.app:3010";

export const API = {
  LOOKUP: {
    PRODUCTS:        `${API_BASE_URL}/lookup/products`,
    TRANSPORTERS:    `${API_BASE_URL}/lookup/transporters`,
    PLANT_CODES:     `${API_BASE_URL}/lookup/plant-codes`,
    SALES_ZONES:     `${API_BASE_URL}/lookup/sales-zones`,
    PACK_CONFIGS:    `${API_BASE_URL}/lookup/pack-configs`,
  },
  ADMIN: {
    SALES_ORDERS:        `${API_BASE_URL}/admin/sales-orders`,
    SALES_ORDER_BY_ID:   (id: string | number) => `${API_BASE_URL}/admin/sales-orders/${id}`,
  },
  SALES: {
    CRUD:                `${API_BASE_URL}/sales-crud`,
    CRUD_BY_ID:          (id: string | number) => `${API_BASE_URL}/sales-crud/${id}`,
    TEMPLATE:            `${API_BASE_URL}/sales-orders/template`,
    IMPORT:              `${API_BASE_URL}/sales-orders/import`,
    DELETE:              (id: string | number) => `${API_BASE_URL}/sales-crud/${id}`,
  },
  AUTH: {
    LOGIN:               `${API_BASE_URL}/auth/login`,
    SIGNUP:              `${API_BASE_URL}/auth/signup`,
    CHECK_EMAIL:         (email: string) =>
      `${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`,
  },
};
