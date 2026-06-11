export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export type ManualFgLocationQuery = {
  date?: string;
  fromDate?: string;
  toDate?: string;
  salesOrderNumber?: string;
};

function buildManualFgLocationQuery(params?: ManualFgLocationQuery) {
  const query = new URLSearchParams();
  if (params?.date) query.set("date", params.date);
  if (params?.fromDate) query.set("fromDate", params.fromDate);
  if (params?.toDate) query.set("toDate", params.toDate);
  if (params?.salesOrderNumber) {
    query.set("salesOrderNumber", params.salesOrderNumber);
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

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
    MOBILE_SYNC_BARCODES:                            `${API_BASE_URL}/lookup/mobile-sync/material-barcodes`,
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

    UPDATE_MAPPING: (orderId: number) =>          `${API_BASE_URL}/admin/orders/${orderId}/erp-materials/update-mapping`,

    USERS:                                        `${API_BASE_URL}/users`,
    USER_BY_ID:          (id: number) =>          `${API_BASE_URL}/users/${id}`,
    SFTP_STATUS:                                  `${API_BASE_URL}/admin/sales-orders/sftp-status`,
    FG_STORAGE_REPORT: (params?: {
    search?: string;
    page?: number;
    limit?: number;
    ageFilter?:string;
}) => {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.page)   query.set('page',   String(params.page));
  if (params?.limit)  query.set('limit',  String(params.limit));
  if (params?.ageFilter) query.set('ageFilter', params.ageFilter);
  const qs = query.toString();
  return `${API_BASE_URL}/reports/sales-order/fg-storage-report${qs ? '?' + qs : ''}`;
},  
  REPORT_ANALYSIS: (params?: {
  search?: string;
  payment?: string;
  salesZoneId?: number | string;
  customerId?: number | string;
  date?: string;
  status?: string;
  page?: number;    
  limit?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.search)      query.set('search',      params.search);
  if (params?.payment)     query.set('payment',     params.payment);
  if (params?.salesZoneId) query.set('salesZoneId', String(params.salesZoneId));
  if (params?.customerId)  query.set('customerId',  String(params.customerId));
  if (params?.date)        query.set('date',        params.date);
  if (params?.status)      query.set('status',      params.status);
  if (params?.page)        query.set('page',        String(params.page));
  if (params?.limit)       query.set('limit',       String(params.limit));
  const qs = query.toString();
  return `${API_BASE_URL}/reports/sales-order/summary${qs ? '?' + qs : ''}`;
},
//Customer report
CUSTOMER_SO_COUNT:       `${API_BASE_URL}/reports/sales-order/customer-report`,
CUSTOMER_SO_BY_MATERIAL: (materialCode: string, fromDate?: string | null, toDate?: string | null) => {
    const query = new URLSearchParams();
    if (fromDate) query.set("startDate", fromDate);
    if (toDate)   query.set("endDate",   toDate);
    const qs = query.toString();
    return `${API_BASE_URL}/reports/sales-order/customers-by-material/${encodeURIComponent(materialCode)}${qs ? "?" + qs : ""}`;
},
// ASSIGN SO 
    ACTIVE_EXPORT_LIST:                               `${API_BASE_URL}/admin/sales-orders/active-export-list`,
   USED_CUSTOMERS:                                     `${API_BASE_URL}/admin/sales-orders/used-customers`,
    BULK_ASSIGN:                                      `${API_BASE_URL}/admin/sales-orders/bulk-assign`,
    ERP_MATERIAL_DATA:                            `${API_BASE_URL}/admin/sales-orders`,
    SKIP_ISSUE_STAGE: (orderId: number, materialId: number) => `${API_BASE_URL}/admin/orders/${orderId}/erp-materials/${materialId}/skip-issue`,
    RESET_ERP_DATA: (id: string | number) => `${API_BASE_URL}/sales-orders/${id}/reset`,

    // Archived Orders table
      ARCHIVED_ORDERS: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      paymentFilter?: string;
      zoneFilter?: string;
      statusFilter?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.page)          query.set("page",          String(params.page));
      if (params?.limit)         query.set("limit",         String(params.limit));
      if (params?.search)        query.set("search",        params.search);
      if (params?.paymentFilter) query.set("paymentFilter", params.paymentFilter);
      if (params?.zoneFilter)    query.set("zoneFilter",    params.zoneFilter);
      if (params?.statusFilter && params.statusFilter !== "None")
                                 query.set("statusFilter",  params.statusFilter);
      if (params?.startDate)     query.set("startDate",     params.startDate);
      if (params?.endDate)       query.set("endDate",       params.endDate);
      const qs = query.toString();
      return `${API_BASE_URL}/archived-data${qs ? "?" + qs : ""}`;
    },
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
    EXCEL_EXPORT:                                         `${API_BASE_URL}/sales-orders/excel-export`,
    EXCEL_IMPORT:                                         `${API_BASE_URL}/sales-orders/excel-import`,
    ATTACHMENTS:                                          `${API_BASE_URL}/sales-crud/attachments`,
    ATTACHMENTS_BY_ORDER: (id: string | number) => `${API_BASE_URL}/sales-crud/${id}/attachments`,
    ATTACHMENT_DOWNLOAD: (id: number) => `${API_BASE_URL}/sales-crud/attachments/download/${id}`,
  },
  AUTH: {
    LOGIN:               `${API_BASE_URL}/auth/login`,
    // Endpoint for mobile login
    MOBILE_LOGIN:        `${API_BASE_URL}/auth/mobile-login`,   
    SIGNUP:              `${API_BASE_URL}/auth/signup`,
    CHECK_EMAIL:         (email: string) =>
                         `${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`,
    CHECK_SESSION:       `${API_BASE_URL}/auth/check-session`,
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
    STATS:                                                 `${API_BASE_URL}/user-dashboard/stats`,
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
    /** PATCH /dispatch/:id — multipart for transporter, vehicle, attachments */
    BY_ID: (id: number) =>                        `${API_BASE_URL}/dispatch/${id}`,
    SEARCH_SO: (soNumber: string) =>              `${API_BASE_URL}/dispatch/search-so/${encodeURIComponent(soNumber)}`,
    LIST_ATTACHMENTS: (id: number) =>             `${API_BASE_URL}/dispatch/${id}/attachments`,
    SO: (id: number) =>                           `${API_BASE_URL}/dispatch/${id}/so`,
    /** PATCH /dispatch/so/:soId — JSON { LRnumber } — use Dispatch_SO.id from GET .../so */
    UPDATE_SO: (soId: number) =>                  `${API_BASE_URL}/dispatch/so/${soId}`,
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
    BASE:                                         `${API_BASE_URL}/dispatch/vehicle-entries`,
    LIST: (params?: { startDate?: string; endDate?: string }) => {
      const query = new URLSearchParams();
      if (params?.startDate) query.set("startDate", params.startDate);
      if (params?.endDate) query.set("endDate", params.endDate);
      const qs = query.toString();
      return `${API_BASE_URL}/dispatch/vehicle-entries${qs ? "?" + qs : ""}`;
    },
    GET_ATTACHMENTS:    (id: string | number) =>  `${API_BASE_URL}/dispatch/vehicle-entries/${id}/attachments`,
    DOWNLOAD_ATTACHMENT: (id: string | number, fileName: string) => `${API_BASE_URL}/dispatch/vehicle-entries/${id}/attachments/${encodeURIComponent(fileName)}`,
    MOBILE: {
      CREATE:                                       `${API_BASE_URL}/vehicle-entry`,
      UPLOAD_ATTACHMENTS: (id: string | number) =>  `${API_BASE_URL}/vehicle-entry/${id}/attachments`,
      GET_ATTACHMENTS:    (id: string | number) =>  `${API_BASE_URL}/vehicle-entry/${id}/attachments`,
      DOWNLOAD_ATTACHMENT: (id: string | number, fileName: string) => `${API_BASE_URL}/vehicle-entry/${id}/attachments/${encodeURIComponent(fileName)}`,
    },
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
    IMPORT_FROM_DRIVE:       `${API_BASE_URL}/erp-material-importer/import-from-drive`,
    BULK_IMPORT_FROM_DRIVE:  `${API_BASE_URL}/erp-material-importer/bulk-import-from-drive`,
    BULK_DOWNLOAD_DRIVE:     `${API_BASE_URL}/erp-material-importer/bulk-download-drive`,
  },
  FG_DASHBOARD:              `${API_BASE_URL}/fg-dashboard`,
  FG_STORAGE: {
    MOBILE_ASSIGN_LOCATION:  `${API_BASE_URL}/fg-storage/assign-location`, // Endpoint for mobile assign location
    MANUAL_LIST: (params?: ManualFgLocationQuery) =>
      `${API_BASE_URL}/manual-fg-location/list${buildManualFgLocationQuery(params)}`,
    MANUAL_DOWNLOAD_EXCEL: (params?: ManualFgLocationQuery) =>
      `${API_BASE_URL}/manual-fg-location/download-excel${buildManualFgLocationQuery(params)}`,
  },
  DASHBOARD: {
    SALES_KPIS:              `${API_BASE_URL}/dashboard/sales-kpis`,
    SALES_ACTIVITY:          `${API_BASE_URL}/dashboard/sales-activity`,
    SALES_PAYMENT_CLEARANCE: `${API_BASE_URL}/dashboard/sales-payment-clearance`,

    SALES_DISPATCH_SUMMARY:  `${API_BASE_URL}/dashboard/sales-dispatch-summary`,
    SALES_NEW_IMPORTS:       `${API_BASE_URL}/dashboard/sales-new-imports`,
    SALES_UPCOMING_ORDERS:   `${API_BASE_URL}/dashboard/sales-upcoming-orders`,
    SALES_OVERALL_STATUS:    `${API_BASE_URL}/dashboard/sales-overall-status`,

    ADMIN_KPIS:              `${API_BASE_URL}/dashboard/admin-kpis`,
    ADMIN_NEW_IMPORTS:       `${API_BASE_URL}/dashboard/admin-new-imports`,
    ADMIN_DISPATCH_SUMMARY:  `${API_BASE_URL}/dashboard/admin-dispatch-summary`,
    ADMIN_OVERALL_STATUS:    `${API_BASE_URL}/dashboard/admin-overall-status`,
    ADMIN_STATUS_BY_ZONE:    `${API_BASE_URL}/dashboard/admin-status-by-zone`,
    ADMIN_PAYMENT_BY_ZONE:   `${API_BASE_URL}/dashboard/admin-payment-by-zone`,
    ADMIN_ORDERS_BY_PRODUCT: `${API_BASE_URL}/dashboard/admin-orders-by-product`,
    ADMIN_ORDERS_BY_CUSTOMER:`${API_BASE_URL}/dashboard/admin-orders-by-customer`,
    ADMIN_UPCOMING_ORDERS:   `${API_BASE_URL}/dashboard/admin-upcoming-orders`,
    ADMIN_STATUS_BY_CUSTOMER:`${API_BASE_URL}/dashboard/admin-status-by-customer`,
    ADMIN_PAYMENT_BY_CUSTOMER:`${API_BASE_URL}/dashboard/admin-payment-by-customer`,
    OPERATOR_STATS: (date?: string) => `${API_BASE_URL}/dashboard/operator-stats${date ? `?date=${date}` : ''}`,
    ADMIN_ERP_IMPORT_COUNTS: (date?: string) => `${API_BASE_URL}/dashboard/admin-erp-import-counts${date ? `?date=${date}` : ''}`,
  },
  SO_CHAT: {
    MENTION_USERS: (orderId: number) => `${API_BASE_URL}/so-chat/${orderId}/mention-users`,
    MESSAGES: (orderId: number) =>      `${API_BASE_URL}/so-chat/${orderId}/messages`,
    SEND: (orderId: number) =>          `${API_BASE_URL}/so-chat/${orderId}/messages`,
  },
  SO_NOTIFICATIONS: {
    LIST:                     `${API_BASE_URL}/so-notifications`,
    DELETE: (id: number) =>   `${API_BASE_URL}/so-notifications/${id}`,
    CLEAR_SO: (orderId: number) => `${API_BASE_URL}/so-notifications/clear-so/${orderId}`,
  },
  SO_SOCKET_BASE: API_BASE_URL,
  // TERMINAL USER DASHBOARD
TERMINAL_USER_DASHBOARD: {
  ORDERS_ASSIGNED_TO_ME:      `${API_BASE_URL}/user-dashboard/stats`,
  OVERDUE_ORDERS:             `${API_BASE_URL}/dashboard/admin-kpis`,
  ORDERS_CREATED:             `${API_BASE_URL}/dashboard/admin-new-imports`,
  TODAYS_DISPATCH:            `${API_BASE_URL}/dashboard/admin-dispatch-summary`,
  ORDER_STATUS_DISTRIBUTION:  `${API_BASE_URL}/dashboard/admin-overall-status`,
  RECENT_ACTIVITY:            `${API_BASE_URL}/user-dashboard/recent-activity`,
},
 SAMBA: {
    FILES: `${API_BASE_URL}/samba/files`,
    DOWNLOAD: `${API_BASE_URL}/samba/download`,
  },

};

/** PATCH /dispatch/so/:soId request body */
export type DispatchSoPatchBody = {
  LRnumber: string;
};

let isFetchRedirecting = false;

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && typeof window !== 'undefined') {
    if (!isFetchRedirecting) {
      isFetchRedirecting = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setTimeout(() => {
          window.location.href = '/login?reason=session-expired';
      }, 500);
    }
    
    return new Promise<Response>(() => {}); 
  }

  return response;
}
