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
    VERIFY_SO:                   (soNumber: string) => `${API_BASE_URL}/sales-crud/verify-so/${soNumber}`,  // Endpoint for Customer Label Print Mobile App
    TEMPLATE:                    `${API_BASE_URL}/sales-orders/template`,
    IMPORT:                      `${API_BASE_URL}/sales-orders/import`,
    DELETE_ORDER:                (id: string | number) => `${API_BASE_URL}/sales-crud/${id}`,
  },
  AUTH: {
    LOGIN:               `${API_BASE_URL}/auth/login`,
    MOBILE_LOGIN:        `${API_BASE_URL}/auth/mobile-login`,   // Endpoint for mobile login
    SIGNUP:              `${API_BASE_URL}/auth/signup`,
    CHECK_EMAIL:         (email: string) =>
      `${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`,
  },
  USER_DASHBOARD: {
    ORDERS:         `${API_BASE_URL}/user-dashboard/orders`,
    MOBILE_ORDERS_SUMMARY: `${API_BASE_URL}/user-dashboard/orders-summary`,    // Endpoint for mobile orders summary
    MOBILE_DOWNLOAD_DETAILS_BY_ID: (id: number) => `${API_BASE_URL}/user-dashboard/orders/${id}/download-details`,  // Endpoint for downloading order details by Order ID (Primary Key)
    MOBILE_DOWNLOAD_DETAILS_BY_SO: (soNumber: string) => `${API_BASE_URL}/user-dashboard/orders/son/${soNumber}/download-details`,  // Endpoint for downloading order details by SO number
    MOBILE_SYNC_ORDER_BY_SO:        (soNumber: string) => `${API_BASE_URL}/user-dashboard/orders/son/${soNumber}/sync`,  // Endpoint for syncing order by SO number (Combined both attachments and data)
    MOBILE_UPLOAD_DATA_BY_SO:       (soNumber: string) => `${API_BASE_URL}/user-dashboard/orders/son/${soNumber}/data`,  // Endpoint for uploading data by SO number
    MOBILE_UPLOAD_ATTACHMENTS_BY_SO: (soNumber: string) => `${API_BASE_URL}/user-dashboard/orders/son/${soNumber}/attachments`, // Endpoint for uploading attachments by SO number
  },
  SO_SEARCH: {
    BY_SO_NUMBER: (soNumber: string) => `${API_BASE_URL}/so-search/${soNumber}`,
  },
  SO_ARCHIVE: {
    ARCHIVE: (soNumber: string) => `${API_BASE_URL}/so-archive/${soNumber}/archive`,
    DELETE: (soNumber: string) => `${API_BASE_URL}/so-archive/${soNumber}/delete`,
    DOWNLOAD_ATTACHMENT: (fileId: number) => `${API_BASE_URL}/so-archive/attachments/${fileId}/download`,
  },
  DISPATCH: { 
    BASE: `${API_BASE_URL}/dispatch`,
    BY_ID: (id: number) => `${API_BASE_URL}/dispatch/${id}`,
    LIST_ATTACHMENTS: (id: number) => `${API_BASE_URL}/dispatch/${id}/attachments`,
    SO: (id: number) => `${API_BASE_URL}/dispatch/${id}/so`,
    DELETE_SO: (soId: number) => `${API_BASE_URL}/dispatch/so/${soId}`,
    PDF: (id: number) => `${API_BASE_URL}/dispatch/${id}/pdf`,
    ATTACHMENT: (id: number, fileName: string) => `${API_BASE_URL}/dispatch/${id}/attachments/${encodeURIComponent(fileName)}`,
    MOBILE: {
      CREATE_HEADER: `${API_BASE_URL}/dispatch/mobile/header`,
      UPDATE_HEADER: (id: number) => `${API_BASE_URL}/dispatch/mobile/${id}`,
      ADD_ATTACHMENTS: (id: number) => `${API_BASE_URL}/dispatch/mobile/${id}/attachments`,
      LINK_SO: (id: number) => `${API_BASE_URL}/dispatch/mobile/${id}/so`,
    },
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
  FG_STORAGE: {
    MOBILE_ASSIGN_LOCATION: `${API_BASE_URL}/fg-storage/assign-location`, // Endpoint for mobile assign location
  },
  DASHBOARD: {
    // SALES DASHBOARD
    SALES_KPIS: `${API_BASE_URL}/dashboard/sales-kpis`,
    SALES_ACTIVITY: `${API_BASE_URL}/dashboard/sales-activity`,
    SALES_PAYMENT_CLEARANCE: `${API_BASE_URL}/dashboard/sales-payment-clearance`,

    // ADMIN DASHBOARD
    ADMIN_KPIS:`${API_BASE_URL}/dashboard/admin-kpis`,
    ADMIN_NEW_IMPORTS:       `${API_BASE_URL}/dashboard/admin-new-imports`,
    ADMIN_DISPATCH_SUMMARY:  `${API_BASE_URL}/dashboard/admin-dispatch-summary`,
    ADMIN_OVERALL_STATUS:    `${API_BASE_URL}/dashboard/admin-overall-status`,
    ADMIN_STATUS_BY_ZONE:    `${API_BASE_URL}/dashboard/admin-status-by-zone`,
    ADMIN_PAYMENT_BY_ZONE:   `${API_BASE_URL}/dashboard/admin-payment-by-zone`,
    ADMIN_ORDERS_BY_PRODUCT: `${API_BASE_URL}/dashboard/admin-orders-by-product`,
    ADMIN_ORDERS_BY_CUSTOMER: `${API_BASE_URL}/dashboard/admin-orders-by-customer`,
  },
};

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}