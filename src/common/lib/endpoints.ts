export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const API = {
  LOOKUP: {
    PRODUCTS:                                   `${API_BASE_URL}/lookup/products`,
    PRODUCT_BY_ID:   (id: string | number) =>   `${API_BASE_URL}/lookup/products/${id}`,
    TRANSPORTERS:                               `${API_BASE_URL}/lookup/transporters`,
    TRANSPORTER_BY_ID: (id: string | number) => `${API_BASE_URL}/lookup/transporters/${id}`,
    PLANT_CODES:                                `${API_BASE_URL}/lookup/plant-codes`,
    PLANT_CODE_BY_ID: (id: string | number) =>  `${API_BASE_URL}/lookup/plant-codes/${id}`,
    SALES_ZONES:                                `${API_BASE_URL}/lookup/sales-zones`,
    SALES_ZONE_BY_ID: (id: string | number) =>  `${API_BASE_URL}/lookup/sales-zones/${id}`,
    PACK_CONFIGS:                               `${API_BASE_URL}/lookup/pack-configs`,
    PACK_CONFIG_BY_ID: (id: string | number) => `${API_BASE_URL}/lookup/pack-configs/${id}`,
    CUSTOMERS:                                  `${API_BASE_URL}/lookup/customers`,
    CUSTOMER_BY_ID: (id: string | number) =>    `${API_BASE_URL}/lookup/customers/${id}`,
    PRINTERS:                                   `${API_BASE_URL}/lookup/printers`,
    PRINTER_BY_ID: (id: string | number) =>     `${API_BASE_URL}/lookup/printers/${id}`,
    MATERIAL_BARCODES:                          `${API_BASE_URL}/lookup/material-barcodes`,
    MATERIAL_BARCODE_BY_ID: (id: string | number) => `${API_BASE_URL}/lookup/material-barcodes/${id}`,
    BULK_TEMPLATE:                                   `${API_BASE_URL}/lookup/bulk-template`,
    BULK_IMPORT:                                     `${API_BASE_URL}/lookup/bulk-import`,
  },
  ADMIN: {
    SALES_ORDERS:                                 `${API_BASE_URL}/admin/sales-orders`,
    SALES_ORDER_BY_ID:   (id: string | number) => `${API_BASE_URL}/admin/sales-orders/${id}`,
    ERP_MATERIALS_BY_ORDER: (orderId: number) =>  `${API_BASE_URL}/admin/orders/${orderId}/erp-materials`,
    INCREMENT_ISSUE_STAGE: (orderId: number) =>   `${API_BASE_URL}/admin/orders/${orderId}/erp-materials/increment-issue-stage`,
    UPDATE_ISSUE_STAGE: (orderId: number) =>      `${API_BASE_URL}/admin/orders/${orderId}/erp-materials/update-issue-stage`,
    INCREMENT_PACKING_STAGE: (orderId: number) => `${API_BASE_URL}/admin/orders/${orderId}/erp-materials/increment-packing-stage`,
    UPDATE_PACKING_STAGE: (orderId: number) =>    `${API_BASE_URL}/admin/orders/${orderId}/erp-materials/update-packing-stage`,
    USERS:                                        `${API_BASE_URL}/users`,
    USER_BY_ID:          (id: number) =>          `${API_BASE_URL}/users/${id}`,
  },
  SALES: {
    CREATE_ORDER:                                         `${API_BASE_URL}/sales-crud`,
    EDIT_ORDER:                  (id: string | number) => `${API_BASE_URL}/sales-crud/${id}`,
    // Endpoint for Customer Label Print POST API Mobile App
    LABEL_PRINT:                                          `${API_BASE_URL}/sales-crud/label-print`, 
    // Endpoint for Customer Label Print GET API Mobile App
    VERIFY_SO:                   (soNumber: string) =>    `${API_BASE_URL}/sales-crud/verify-so/${soNumber}`,  
    TEMPLATE:                                             `${API_BASE_URL}/sales-orders/template`,
    IMPORT:                                               `${API_BASE_URL}/sales-orders/import`,
    DELETE_ORDER:                (id: string | number) => `${API_BASE_URL}/sales-crud/${id}`,
    // GET request to this URL lists orders
    LIST_ORDERS:                                          `${API_BASE_URL}/sales-crud`, 
  },
  AUTH: {
    LOGIN:               `${API_BASE_URL}/auth/login`,
    // Endpoint for mobile login
    MOBILE_LOGIN:        `${API_BASE_URL}/auth/mobile-login`,   
    SIGNUP:              `${API_BASE_URL}/auth/signup`,
    CHECK_EMAIL:         (email: string) =>
                         `${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`,
  },
  USER_DASHBOARD: {
    ORDERS:                                                `${API_BASE_URL}/user-dashboard/orders`,
    // Endpoint for mobile orders summary
    MOBILE_ORDERS_SUMMARY:                                 `${API_BASE_URL}/user-dashboard/orders-summary`,    
    // Endpoint for downloading order details by Order ID (Primary Key)
    MOBILE_DOWNLOAD_DETAILS_BY_ID: (id: number) =>         `${API_BASE_URL}/user-dashboard/orders/${id}/download-details`,  
    // Endpoint for downloading order details by SO number
    MOBILE_DOWNLOAD_DETAILS_BY_SO: (soNumber: string) =>   `${API_BASE_URL}/user-dashboard/orders/son/${soNumber}/download-details`,  
    // Endpoint for syncing order by SO number (Combined both attachments and data)
    MOBILE_SYNC_ORDER_BY_SO:        (soNumber: string) =>  `${API_BASE_URL}/user-dashboard/orders/son/${soNumber}/sync`,  
    // Endpoint for uploading data by SO number
    MOBILE_UPLOAD_DATA_BY_SO:       (soNumber: string) =>  `${API_BASE_URL}/user-dashboard/orders/son/${soNumber}/data`,  
    // Endpoint for uploading attachments by SO number
    MOBILE_UPLOAD_ATTACHMENTS_BY_SO: (soNumber: string) => `${API_BASE_URL}/user-dashboard/orders/son/${soNumber}/attachments`, 
    // Get Order Details by ID
    GET_ORDER_DETAILS: (id: number) =>                     `${API_BASE_URL}/user-dashboard/orders/${id}`,
  },
  USER: {
    RESET_PASSWORD:                          `${API_BASE_URL}/users/reset-password`,
  },
  SO_SEARCH: {
    BY_SO_NUMBER: (soNumber: string) =>      `${API_BASE_URL}/so-search/${soNumber}`,
  },
  SO_ARCHIVE: {
    ARCHIVE: (soNumber: string) =>           `${API_BASE_URL}/so-archive/${soNumber}/archive`,
    DELETE: (soNumber: string) =>            `${API_BASE_URL}/so-archive/${soNumber}/delete`,
    DOWNLOAD_ATTACHMENT: (fileId: number) => `${API_BASE_URL}/so-archive/attachments/${fileId}/download`,

    DOWNLOAD_DISPATCH_ATTACHMENT: (id: number, fileName: string) => 
      `${API_BASE_URL}/so-archive/dispatch/${id}/attachments/${encodeURIComponent(fileName)}`,
    DOWNLOAD_VEHICLE_ATTACHMENT: (id: number, fileName: string) => 
      `${API_BASE_URL}/so-archive/vehicle-entry/${id}/attachments/${encodeURIComponent(fileName)}`,
  },
  DISPATCH: { 
    BASE:                                         `${API_BASE_URL}/dispatch`,
    BY_ID: (id: number) =>                        `${API_BASE_URL}/dispatch/${id}`,
    LIST_ATTACHMENTS: (id: number) =>             `${API_BASE_URL}/dispatch/${id}/attachments`,
    SO: (id: number) =>                           `${API_BASE_URL}/dispatch/${id}/so`,
    DELETE_SO: (soId: number) =>                  `${API_BASE_URL}/dispatch/so/${soId}`,
    PDF: (id: number) =>                          `${API_BASE_URL}/dispatch/${id}/pdf`,
    ATTACHMENT: (id: number, fileName: string) => `${API_BASE_URL}/dispatch/${id}/attachments/${encodeURIComponent(fileName)}`,
    MOBILE: {
      CREATE_HEADER:                   `${API_BASE_URL}/dispatch/mobile/header`,
      UPDATE_HEADER: (id: number) =>   `${API_BASE_URL}/dispatch/mobile/${id}`,
      ADD_ATTACHMENTS: (id: number) => `${API_BASE_URL}/dispatch/mobile/${id}/attachments`,
      LINK_SO: (id: number) =>         `${API_BASE_URL}/dispatch/mobile/${id}/so`,
    },
  },
  // Endpoints for Vehicle Entry Module
  VEHICLE_ENTRY: {
    CREATE:                                       `${API_BASE_URL}/vehicle-entry`,
    UPLOAD_ATTACHMENTS: (id: string | number) =>  `${API_BASE_URL}/vehicle-entry/${id}/attachments`,
    GET_ATTACHMENTS:    (id: string | number) =>  `${API_BASE_URL}/vehicle-entry/${id}/attachments`,
    DOWNLOAD_ATTACHMENT: (id: string | number, fileName: string) => `${API_BASE_URL}/vehicle-entry/${id}/attachments/${encodeURIComponent(fileName)}`,
  },
  ERP_MATERIAL_FILES: {
    BASE:                    `${API_BASE_URL}/v1/erp-material-files`,
    BY_ID: (id: number) =>   `${API_BASE_URL}/v1/erp-material-files/${id}`,
    BY_SO: (so: string) =>   `${API_BASE_URL}/v1/erp-material-files/by-sale-order/${encodeURIComponent(so)}`,

    //Download file stream
    DOWNLOAD: (id: number) =>                     `${API_BASE_URL}/v1/erp-material-files/${id}/download`,
    //Upload file endpoint
    UPLOAD:                                       `${API_BASE_URL}/v1/erp-material-files/upload`,
    //Upload with descriptions
    UPLOAD_WITH_DESC:                             `${API_BASE_URL}/v1/erp-material-files/upload-with-descriptions`,
  },
  ERP_IMPORTER: {
    UPLOAD:                  `${API_BASE_URL}/erp-material-importer/upload`,
  },
  FG_DASHBOARD:              `${API_BASE_URL}/fg-dashboard`,
  FG_STORAGE: {
    MOBILE_ASSIGN_LOCATION:  `${API_BASE_URL}/fg-storage/assign-location`, // Endpoint for mobile assign location
  },
  DASHBOARD: {
    SALES_KPIS:              `${API_BASE_URL}/dashboard/sales-kpis`,
    SALES_ACTIVITY:          `${API_BASE_URL}/dashboard/sales-activity`,
    SALES_PAYMENT_CLEARANCE: `${API_BASE_URL}/dashboard/sales-payment-clearance`,
    ADMIN_KPIS:              `${API_BASE_URL}/dashboard/admin-kpis`,
    ADMIN_NEW_IMPORTS:       `${API_BASE_URL}/dashboard/admin-new-imports`,
    ADMIN_DISPATCH_SUMMARY:  `${API_BASE_URL}/dashboard/admin-dispatch-summary`,
    ADMIN_OVERALL_STATUS:    `${API_BASE_URL}/dashboard/admin-overall-status`,
    ADMIN_STATUS_BY_ZONE:    `${API_BASE_URL}/dashboard/admin-status-by-zone`,
    ADMIN_PAYMENT_BY_ZONE:   `${API_BASE_URL}/dashboard/admin-payment-by-zone`,
    ADMIN_ORDERS_BY_PRODUCT: `${API_BASE_URL}/dashboard/admin-orders-by-product`,
    ADMIN_ORDERS_BY_CUSTOMER:`${API_BASE_URL}/dashboard/admin-orders-by-customer`,
  },
  SO_CHAT: {
    MENTION_USERS: (soNumber: string) => `${API_BASE_URL}/so-chat/${encodeURIComponent(soNumber)}/mention-users`,
    MESSAGES: (soNumber: string) =>      `${API_BASE_URL}/so-chat/${encodeURIComponent(soNumber)}/messages`,
    SEND: (soNumber: string) =>          `${API_BASE_URL}/so-chat/${encodeURIComponent(soNumber)}/messages`,
  },
  SO_NOTIFICATIONS: {
    LIST:                     `${API_BASE_URL}/so-notifications`,
    DELETE: (id: number) =>   `${API_BASE_URL}/so-notifications/${id}`,
    CLEAR_SO: (id: number) => `${API_BASE_URL}/so-notifications/clear-so/${id}`,
  },
  SO_SOCKET_BASE: API_BASE_URL,
};

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}