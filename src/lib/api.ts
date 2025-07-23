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
