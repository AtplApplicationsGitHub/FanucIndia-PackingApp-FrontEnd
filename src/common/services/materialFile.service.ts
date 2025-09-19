import { API } from '@/common/lib/endpoints';
import type {
  MaterialFile,
  MaterialFileListResponse,
  CreateMaterialFileInput,
  MaterialFileQuery,
  Paginated,
} from '@/app/admin/material-files/types/material-file';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}

export async function getMaterialFilesBySaleOrder(saleOrderNumber: string): Promise<MaterialFile[]> {
  const res = await fetchWithAuth(API.ERP_MATERIAL_FILES.BY_SO(saleOrderNumber), { cache: 'no-cache' });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to load files by SO');
  return res.json() as Promise<MaterialFile[]>;
}

export async function getMaterialFiles(params: MaterialFileQuery): Promise<Paginated<MaterialFileListResponse>> {
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

export async function getMaterialFileById(id: number): Promise<MaterialFile> {
  const res = await fetchWithAuth(API.ERP_MATERIAL_FILES.BY_ID(id), { cache: 'no-cache' });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to load material file');
  return res.json() as Promise<MaterialFile>;
}

export async function createMaterialFile(payload: CreateMaterialFileInput): Promise<MaterialFile> {
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
): Promise<MaterialFile> {
  const res = await fetchWithAuth(API.ERP_MATERIAL_FILES.BY_ID(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to update material file');
  return res.json() as Promise<MaterialFile>;
}

export async function deleteMaterialFile(id: number): Promise<{ success: boolean }> {
  const res = await fetchWithAuth(API.ERP_MATERIAL_FILES.BY_ID(id), { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to delete material file');
  return res.json() as Promise<{ success: boolean }>;
}

export async function uploadMaterialFile(
  file: File,
  saleOrderNumber?: string | null,
  description?: string,
): Promise<{ success: boolean; items: MaterialFile[] }> {
  return uploadMaterialFiles(saleOrderNumber ?? null, description ?? null, [file]);
}

export async function uploadMaterialFiles(
  saleOrderNumber: string | undefined | null,
  description: string | undefined | null,
  files: File[],
  signal?: AbortSignal,
): Promise<{ success: boolean; items: MaterialFile[] }> {
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