import { API } from '@/common/lib/endpoints';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
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
    issueStage: number,
    materialId?: number
) {
    const url = API.ADMIN.UPDATE_ISSUE_STAGE(orderId);
    const res = await fetchWithAuth(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialCode, issueStage, materialId }),
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
    packingStage: number,
    materialId?: number
) {
    const url = API.ADMIN.UPDATE_PACKING_STAGE(orderId);
    const res = await fetchWithAuth(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialCode, packingStage, materialId }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update packing stage");
    }
    return res.json();
}

export async function bulkAcceptGroup(
  orderId: number,
  group: string,
  stageType: 'issue' | 'packing'
) {
  const url = `${API.ADMIN.ERP_MATERIALS_BY_ORDER(orderId)}/bulk-accept-group`;
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ group, stageType }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to bulk accept group");
  }
  return res.json();
}

export async function updateMaterialRemarks(
  orderId: number,
  materialId: number,
  remarks: string
) {
  const url = `${API.ADMIN.ERP_MATERIALS_BY_ORDER(orderId)}/${materialId}/remarks`;
  const res = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ remarks }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update remarks");
  }
  return res.json();
}

export async function acceptAllIssueStage(orderId: number) {
  const url = `${API.ADMIN.ERP_MATERIALS_BY_ORDER(orderId)}/accept-all-issue-stage`;
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to accept all issue stage");
  }
  return res.json();
}

export async function updateMapping(
    orderId: number,
    materialId: number,
    mappingBarcode: string,
    group: string
) {
    const url = API.ADMIN.UPDATE_MAPPING(orderId);
    
    const res = await fetchWithAuth(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId, mappingBarcode, group }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update mapping");
    }
    return res.json();
}