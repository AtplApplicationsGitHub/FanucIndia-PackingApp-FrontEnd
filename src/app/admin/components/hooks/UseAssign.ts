"use client";

import { useState, useEffect, useCallback } from "react";
import { SalesOrder, Lookup } from "@/app/admin/components/types/admin";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

export function useAssign() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const detailsRes = await fetchWithAuth(API.ADMIN.SALES_ORDERS);
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

      // Create lookup map by saleOrderNumber for quick merge
      const detailsMap = new Map<string, any>();
      detailedOrders.forEach((detail: any) => {
        if (detail.saleOrderNumber) {
          detailsMap.set(detail.saleOrderNumber, detail);
        }
      });

      // Merge data: prefer detailed record when available
      const mappedOrders: SalesOrder[] = simpleOrders.map(
        (item: any, index: number) => {
          const son = item.saleOrderNumber || item.son;
          const detail = detailsMap.get(son) || {};

          return {
            id: detail.id || item.id || index + 1,

            user:
              detail.user ||
              (item.userName ? { name: item.userName } : null) ||
              null,

            product:
              detail.product ||
              (item.product ? { name: item.product } : null) ||
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
              (item.assignedUser ? { name: item.assignedUser } : null) ||
              null,
            assignedUserId:
              detail.assignedUserId || item.assignedUserId || null,

            hasMaterialData:
              detail.hasMaterialData ?? item.hasMaterialData ?? false,
            skipIssueStage:
              detail.skipIssueStage ??
              item.skipIssueStage ??
              detail.skipStage ??
              item.skipStage ??
              false,
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
          fetchWithAuth(API.ADMIN.USED_CUSTOMERS),
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
          ? users.map((u: any) => ({ id: u.id, name: u.name || "Unknown" }))
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
              address: c.address || "", // 👈 Added to satisfy TypeScript
              contact: c.contact || ""  // 👈 Added to satisfy TypeScript
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

  // Restored functions that were missing
  const updateInline = async (id: number, field: string, value: any) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)),
    );

    try {
      const response = await fetchWithAuth(API.ADMIN.SALES_ORDER_BY_ID(id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }
    } catch (err) {
      console.error("Update failed:", err);
      // Revert or refresh on error
      fetchData(true);
    }
  };

  const bulkUpdate = useCallback(
    async (ids: number[], assignedUserId: any, priorityStr?: string) => {
      // Optimistic update
      const normalizedId =
        assignedUserId === "" ||
        assignedUserId === "null" ||
        assignedUserId === null ||
        assignedUserId === "unassign"
          ? undefined
          : Number(assignedUserId);

      // Find the user name from lookup for optimistic update of the object
      const selectedUser = lookup.assignableUsers.find(
        (u) => u.id === normalizedId,
      );
      const priorityVal =
        priorityStr && priorityStr.trim() !== ""
          ? Number(priorityStr)
          : undefined;

      setOrders((prev) =>
        prev.map((o) =>
          ids.includes(o.id)
            ? {
                ...o,
                assignedUserId: normalizedId,
                assignedUser: selectedUser
                  ? { id: selectedUser.id, name: selectedUser.name }
                  : null,
                ...(priorityVal !== undefined ? { priority: priorityVal } : {}),
              }
            : o,
        ),
      );

      try {
        const response = await fetchWithAuth(API.ADMIN.BULK_ASSIGN, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            salesOrderIds: ids,
            assignedUserId: normalizedId ?? null,
            ...(priorityVal !== undefined ? { priority: priorityVal } : {}),
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
          } catch (e) {}
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
    refresh: fetchData,
  };
}
