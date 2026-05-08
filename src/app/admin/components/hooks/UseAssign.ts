"use client";
import dayjs from "dayjs";
import { useState, useEffect, useCallback } from "react";
import { SalesOrder, Lookup } from "@/app/admin/components/types/admin";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

export function useAssign() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dynamicCounts, setDynamicCounts] = useState({
    R105: 0,
    W105: 0,
    PendingImport: 0,
    ErpImportFailed: 0,
    ErpSuccessUpload: 0,
  });

  const fetchDynamicCounts = useCallback(async (filters: any) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.paymentFilter)
        queryParams.append("paymentFilter", filters.paymentFilter);
      if (filters.zoneFilter)
        queryParams.append("zoneFilter", filters.zoneFilter);
      if (filters.statusFilter)
        queryParams.append("statusFilter", filters.statusFilter);
      if (filters.customerFilter)
        queryParams.append("customerFilter", filters.customerFilter);
      if (filters.startDate)
        queryParams.append(
          "startDate",
          dayjs(filters.startDate).format("YYYY-MM-DD"),
        );
      if (filters.endDate)
        queryParams.append(
          "endDate",
          dayjs(filters.endDate).format("YYYY-MM-DD"),
        );
      if (filters.pendingImportFilter)
        queryParams.append("pendingImportFilter", "true");

      const res = await fetchWithAuth(
        `${API.ADMIN.SALES_ORDERS}/counts/dynamic?${queryParams.toString()}`,
      );
      let countsData = {
        R105: 0,
        W105: 0,
        PendingImport: 0,
        ErpImportFailed: 0,
        ErpSuccessUpload: 0,
      };

      if (res.ok) {
        const data = await res.json();
        countsData = { ...countsData, ...data };
      }

      setDynamicCounts(countsData);
    } catch (err) {
      console.error("Failed to fetch dynamic counts", err);
    }
  }, []);

  const downloadFailedErpData = useCallback(async (orderIds: number[]) => {
    try {
      const response = await fetchWithAuth(
        `${API.ADMIN.SALES_ORDERS}/download-failed-erp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIds }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || "Failed to download",
          missingOrders: errorData.missing || [],
        };
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename =
        orderIds.length === 1
          ? `Failed_ERP_Data_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`
          : `Failed_ERP_Data_${dayjs().format("YYYYMMDD_HHmm")}.zip`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, missingOrders: [] };
    } catch (err: any) {
      return { success: false, message: err.message, missingOrders: [] };
    }
  }, []);

  const [lookup, setLookup] = useState<Lookup>({
    products: [],
    transporters: [],
    plantCodes: [],
    salesZones: [],
    packConfigs: [],
    assignableUsers: [],
    customers: [],
  });

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      // 1. Get the simplified list for UI (Active Export List)
      const listRes = await fetchWithAuth(API.ADMIN.ACTIVE_EXPORT_LIST);
      if (listRes.status === 401 || listRes.status === 403) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return;
      }
      if (!listRes.ok) {
        throw new Error("Failed to fetch active export list");
      }
      const listData = await listRes.json();

      const simpleOrders = Array.isArray(listData)
        ? listData
        : listData.data || [];

      // 2. Get detailed records (for id, hasMaterialData, etc.)
      const detailsRes = await fetchWithAuth(`${API.ADMIN.SALES_ORDERS}?limit=5000`);
      if (detailsRes.status === 401 || detailsRes.status === 403) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return;
      }
      if (!detailsRes.ok) {
        throw new Error("Failed to fetch detailed sales orders");
      }
      const detailedData = await detailsRes.json();
      const detailedOrders = Array.isArray(detailedData)
        ? detailedData
        : detailedData.data || [];

      // Create lookup map by composite key (SaleOrder + OBD) to prevent overlap
      const detailsMap = new Map<string, any>();
      detailedOrders.forEach((detail: any) => {
        if (detail.saleOrderNumber) {
          const obd = detail.outboundDelivery || "";
          detailsMap.set(`${detail.saleOrderNumber}_${obd}`, detail);
        }
      });

      // Merge data: prefer detailed record when available
      const mappedOrders: SalesOrder[] = simpleOrders.map(
        (item: any, index: number) => {
          const son = item.saleOrderNumber || item.son;
          const obd = item.outboundDelivery || item.obd || "";
          const detail = detailsMap.get(`${son}_${obd}`) || {};

          return {
            id: item.id || detail.id || index + 1,

            user:
              detail.user ||
              item.user ||
              (item.userName ? { name: item.userName } : null) ||
              null,

            product:
              detail.product ||
              (item.product
                ? typeof item.product === "string"
                  ? { name: item.product }
                  : item.product
                : null) ||
              null,
            productId: detail.productId || null,

            saleOrderNumber: son,
            outboundDelivery:
              detail.outboundDelivery ||
              item.outboundDelivery ||
              item.obd ||
              "",
            transferOrder: detail.transferOrder || item.transferOrder || "",

            deliveryDate:
              detail.deliveryDate ||
              item.requiredDate ||
              item.deliveryDate ||
              null,

            paymentClearance:
              detail.paymentClearance ??
              item.payment ??
              item.paymentClearance ??
              false,

            salesZone:
              detail.salesZone ||
              (item.salesZone ? { name: item.salesZone } : null) ||
              null,
            salesZoneId: detail.salesZoneId || item.salesZoneId || null,

            customerNameText:
              detail.customerNameText ||
              detail.customer?.name ||
              item.customer ||
              item.customerNameText ||
              "-",

            customerId: detail.customerId || item.customerId || null,

            status: detail.status ?? item.status ?? null,
            priority: detail.priority ?? item.priority ?? null,

            assignedUser:
              detail.assignedUser ||
              (item.assignedUser
                ? typeof item.assignedUser === "string"
                  ? { name: item.assignedUser }
                  : item.assignedUser
                : null) ||
              null,
            assignedUserId:
              detail.assignedUserId || item.assignedUserId || null,
            issueUser:
              detail.issueUser ||
              (item.issueUser
                ? typeof item.issueUser === "string"
                  ? { name: item.issueUser }
                  : item.issueUser
                : null) ||
              null,
            issueUserId:
              detail.issueAssignedUserId ||
              detail.issueUserId ||
              item.issueAssignedUserId ||
              item.issueUserId ||
              null,
            packingUser:
              detail.packingUser ||
              (item.packingUser
                ? typeof item.packingUser === "string"
                  ? { name: item.packingUser }
                  : item.packingUser
                : null) ||
              null,
            packingUserId:
              detail.packingAssignedUserId ||
              detail.packingUserId ||
              item.packingAssignedUserId ||
              item.packingUserId ||
              null,

            hasMaterialData:
              detail.hasMaterialData ?? item.hasMaterialData ?? false,
            hasFailedImport:
              item.hasFailedImport ?? detail.hasFailedImport ?? false,
            skipIssueStage:
              detail.skipIssueStage ??
              item.skipIssueStage ??
              detail.skipStage ??
              item.skipStage ??
              false,
            skipPackingStage:
              detail.skipPackingStage ?? item.skipPackingStage ?? false,
            notificationCount: detail.notificationCount ?? 0,
            transporter: detail.transporter || item.transporter || null,
            plantCode: detail.plantCode || item.plantCode || "",
            packConfig: detail.packConfig || item.packConfig || null,
            specialRemarks: detail.specialRemarks || item.specialRemarks || "",
            additionalRemarks:
              detail.additionalRemarks || item.additionalRemarks || "",
            labelRemarks: detail.labelRemarks || item.labelRemarks || "",
            materialData: detail.materialData || item.materialData || undefined,
            binCount: detail.binCount ?? item.binCount ?? 0,
          };
        },
      );

      setOrders(mappedOrders);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load sales orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchLookups = useCallback(async () => {
    try {
      const [usersRes, productsRes, zonesRes, packConfigsRes, customersRes] =
        await Promise.all([
          fetchWithAuth(`${API.ADMIN.USERS}?role=USER`),
          fetchWithAuth(API.LOOKUP.PRODUCTS),
          fetchWithAuth(API.LOOKUP.SALES_ZONES),
          fetchWithAuth(API.LOOKUP.PACK_CONFIGS),
          fetchWithAuth(API.LOOKUP.CUSTOMERS),
        ]);

      const [users, products, zones, packConfigs, customers] =
        await Promise.all([
          usersRes.json(),
          productsRes.json(),
          zonesRes.json(),
          packConfigsRes.json(),
          customersRes.json(),
        ]);

      if (
        usersRes.status === 401 ||
        productsRes.status === 401 ||
        zonesRes.status === 401
      ) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return;
      }

      setLookup({
        assignableUsers: Array.isArray(users)
          ? users.map((u: any) => ({
            id: u.id,
            name: u.email || u.name || "Unknown",
          }))
          : [],
        products: Array.isArray(products) ? products : [],
        salesZones: Array.isArray(zones) ? zones : [],
        packConfigs: Array.isArray(packConfigs) ? packConfigs : [],
        transporters: [],
        plantCodes: [],
        customers: Array.isArray(customers)
          ? customers.map((c: any) => ({
            id: c.id,
            name: c.name || "Unknown",
            address: c.address || "",
            contact: c.contact || "",
          }))
          : [],
      });
    } catch (err) {
      console.error("Failed to load lookups", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchLookups();
  }, [fetchData, fetchLookups]);

  const updateInline = async (id: number, field: string, value: any) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;

        const updated = { ...o, [field]: value };

        if (field === "issueUserId") {
          const userObj = lookup.assignableUsers.find((u) => u.id === value);
          updated.issueUser = userObj
            ? { id: userObj.id, name: userObj.name }
            : null;
        } else if (field === "packingUserId") {
          const userObj = lookup.assignableUsers.find((u) => u.id === value);
          updated.packingUser = userObj
            ? { id: userObj.id, name: userObj.name }
            : null;
        } else if (field === "assignedUserId") {
          const userObj = lookup.assignableUsers.find((u) => u.id === value);
          updated.assignedUser = userObj
            ? { id: userObj.id, name: userObj.name }
            : null;
        }

        return updated;
      }),
    );

    let payloadField = field;
    if (field === "issueUserId") {
      payloadField = "issueAssignedUserId";
    } else if (field === "packingUserId") {
      payloadField = "packingAssignedUserId";
    }

    try {
      const response = await fetchWithAuth(API.ADMIN.SALES_ORDER_BY_ID(id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [payloadField]: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }
    } catch (err) {
      console.error("Update failed:", err);
      fetchData(true);
    }
  };

  const bulkUpdate = useCallback(
    async (
      ids: number[],
      assignedUserId: any,
      priorityStr?: string,
      issueUserId?: string,
      packingUserId?: string,
      skipIssue?: string,
      skipPacking?: string,
    ) => {
      // Optimistic update
      let normalizedId: number | null | undefined;
      if (
        assignedUserId === "unassign" ||
        assignedUserId === null ||
        assignedUserId === "null"
      ) {
        normalizedId = null;
      } else if (assignedUserId === undefined || assignedUserId === "") {
        normalizedId = undefined;
      } else {
        normalizedId = Number(assignedUserId);
      }

      // Find the user name from lookup for optimistic update of the object
      const selectedUser = lookup.assignableUsers.find(
        (u) => u.id === normalizedId,
      );
      const priorityVal =
        priorityStr && priorityStr.trim() !== ""
          ? Number(priorityStr)
          : undefined;

      const normalizedIssueId =
        issueUserId === "" ||
          issueUserId === "null" ||
          issueUserId === null ||
          issueUserId === "unassign"
          ? null
          : issueUserId
            ? Number(issueUserId)
            : undefined;
      const normalizedPackingId =
        packingUserId === "" ||
          packingUserId === "null" ||
          packingUserId === null ||
          packingUserId === "unassign"
          ? null
          : packingUserId
            ? Number(packingUserId)
            : undefined;
      const issueUserObj = normalizedIssueId
        ? lookup.assignableUsers.find((u) => u.id === normalizedIssueId)
        : null;
      const packingUserObj = normalizedPackingId
        ? lookup.assignableUsers.find((u) => u.id === normalizedPackingId)
        : null;

      setOrders((prev) =>
        prev.map((o) => {
          if (ids.includes(o.id)) {
            const shouldUpdateToR105 =
              (o.status === null || !o.status) &&
              (normalizedId !== undefined ||
                priorityVal !== undefined ||
                normalizedIssueId !== undefined ||
                normalizedPackingId !== undefined);

            return {
              ...o,
              ...(normalizedId !== undefined
                ? {
                  assignedUserId:
                    normalizedId === null ? undefined : normalizedId,
                }
                : {}),
              ...(selectedUser
                ? {
                  assignedUser: {
                    id: selectedUser.id,
                    name: selectedUser.name,
                  },
                }
                : normalizedId === null
                  ? { assignedUser: null }
                  : {}),
              ...(priorityVal !== undefined ? { priority: priorityVal } : {}),
              ...(normalizedIssueId !== undefined
                ? {
                  issueUserId:
                    normalizedIssueId === null
                      ? undefined
                      : normalizedIssueId,
                }
                : {}),
              ...(issueUserObj
                ? {
                  issueUser: { id: issueUserObj.id, name: issueUserObj.name },
                }
                : normalizedIssueId === null
                  ? { issueUser: null }
                  : {}),
              ...(normalizedPackingId !== undefined
                ? {
                  packingUserId:
                    normalizedPackingId === null
                      ? undefined
                      : normalizedPackingId,
                }
                : {}),
              ...(packingUserObj
                ? {
                  packingUser: {
                    id: packingUserObj.id,
                    name: packingUserObj.name,
                  },
                }
                : normalizedPackingId === null
                  ? { packingUser: null }
                  : {}),

              ...(skipIssue !== undefined && skipIssue !== "none"
                ? { skipIssueStage: skipIssue === "yes" }
                : {}),
              ...(skipPacking !== undefined && skipPacking !== "none"
                ? { skipPackingStage: skipPacking === "yes" }
                : {}),
              ...(shouldUpdateToR105 ? { status: "R105" } : {}),
            };
          }
          return o;
        }),
      );

      try {
        // removed

        const response = await fetchWithAuth(API.ADMIN.BULK_ASSIGN, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            salesOrderIds: ids,
            ...(normalizedId !== undefined
              ? { assignedUserId: normalizedId }
              : {}),
            ...(priorityVal !== undefined ? { priority: priorityVal } : {}),
            ...(normalizedIssueId !== undefined
              ? { issueUserId: normalizedIssueId }
              : {}),
            ...(normalizedPackingId !== undefined
              ? { packingUserId: normalizedPackingId }
              : {}),
            ...(skipIssue !== undefined && skipIssue !== "none"
              ? { skipIssueStage: skipIssue === "yes" }
              : {}),
            ...(skipPacking !== undefined && skipPacking !== "none"
              ? { skipPackingStage: skipPacking === "yes" }
              : {}),
          }),
        });

        if (!response.ok) {
          let errorMsg = "Bulk update failed";
          try {
            const errorData = await response.json();
            errorMsg =
              errorData.message ||
              errorData.error ||
              (Array.isArray(errorData.message)
                ? errorData.message.join(", ")
                : JSON.stringify(errorData)) ||
              errorMsg;
          } catch (e) {
            // Fallback if response is not JSON
          }
          throw new Error(errorMsg);
        }

        // Refresh to get full objects from server
        await fetchData(true);
        return true;
      } catch (err: any) {
        const errorMsg = err.message || "Bulk update failed";
        console.error("Bulk update failed:", errorMsg);
        await fetchData(true);
        throw new Error(errorMsg);
      }
    },
    [lookup.assignableUsers, fetchData],
  );

  const bulkImportErpData = useCallback(
    async (saleOrderNumbers: string[]) => {
      try {
        const response = await fetchWithAuth(
          API.ERP_IMPORTER.BULK_IMPORT_FROM_DRIVE,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ saleOrderNumbers }),
          },
        );

        if (!response.ok) {
          throw new Error("Bulk import failed");
        }

        const data = await response.json();
        await fetchData(true); // Refresh data to show updated status
        return data;
      } catch (err: any) {
        console.error("Bulk import error:", err);
        throw new Error(err.message || "Failed to import ERP data");
      }
    },
    [fetchData],
  );

  const updateSkipStage = useCallback(
    async (orderIds: number[], skip: boolean) => {
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) =>
          orderIds.includes(o.id) ? { ...o, skipIssueStage: skip } : o,
        ),
      );

      try {
        // Call the bulk-skip-stage backend endpoint directly
        const response = await fetchWithAuth(
          `${API.ADMIN.SALES_ORDERS}/bulk-skip-stage`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              salesOrderIds: orderIds,
              skipStage: skip,
            }),
          },
        );

        if (!response.ok) {
          let errorMsg = "Failed to update skip issue stage";
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) {
            // Fallback if response is not JSON
          }
          throw new Error(errorMsg);
        }

        // Refresh the table to show updated status
        await fetchData(true);
        return true;
      } catch (err: any) {
        console.error("Failed to update skip stage", err);
        throw new Error(err.message || "Failed to update skip stage");
      }
    },
    [fetchData],
  );

  const uploadExcelUpdates = useCallback(
    async (formData: FormData) => {
      try {
        const response = await fetchWithAuth(
          `${API.ADMIN.SALES_ORDERS}/excel-import`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          return {
            success: false,
            message: errData.message || "Failed to import excel",
          };
        }

        const data = await response.json();
        await fetchData(true);

        return { success: true, message: data.message };
      } catch (err: any) {
        console.error("Excel import error:", err);
        return {
          success: false,
          message: err.message || "Failed to upload Excel file",
        };
      }
    },
    [fetchData],
  );

  const bulkUpdatePriority = useCallback(
    async (orderIds: number[], priority: number | null) => {
      setOrders((prev) =>
        prev.map((o) => (orderIds.includes(o.id) ? { ...o, priority } : o)),
      );

      try {
        const response = await fetchWithAuth(
          `${API.ADMIN.SALES_ORDERS}/bulk-update-priority`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ salesOrderIds: orderIds, priority }),
          },
        );

        if (!response.ok) {
          let errorMsg = "Failed to update priority";
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) { }
          throw new Error(errorMsg);
        }

        await fetchData(true);
        return true;
      } catch (err: any) {
        console.error("Failed to update priority", err);
        throw new Error(err.message || "Failed to update priority");
      }
    },
    [fetchData],
  );

  const downloadErpData = useCallback(async (saleOrderNumbers: string[]) => {
    try {
      const response = await fetchWithAuth(
        API.ERP_IMPORTER.BULK_DOWNLOAD_DRIVE,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ saleOrderNumbers }),
        },
      );

      if (!response.ok) {
        let errorMsg = "Download failed";
        let missing: string[] = [];
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
          missing = errorData.missing || [];
        } catch (e) { }
        // FIX: Return an object instead of throwing an Error
        return { success: false, message: errorMsg, missingSOs: missing };
      }

      // Read the custom header to see if any files were missing
      const missingHeader = response.headers.get("X-Missing-SOs");
      const missingSOs = missingHeader
        ? missingHeader.split(",").filter(Boolean)
        : [];

      // Trigger file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `ERP_Data_${dayjs().format("YYYYMMDD_HHmm")}.zip`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, missingSOs };
    } catch (err: any) {
      console.error("ERP Data download error:", err);
      return {
        success: false,
        message: err.message || "Failed to download ERP data",
        missingSOs: [],
      };
    }
  }, []);

  return {
    orders,
    lookup,
    loading,
    error,
    updateInline,
    bulkUpdate,
    bulkImportErpData,
    updateSkipStage,
    uploadExcelUpdates,
    bulkUpdatePriority,
    downloadErpData,
    refresh: fetchData,
    dynamicCounts,
    fetchDynamicCounts,
    downloadFailedErpData,
  };
}
