'use client'
export interface MaterialFile {
  ID: number;

  saleOrderNumber: string | null;
  fileName: string;
  description: string | null;

  sftpPath: string;
  sftpDir: string;

  fileSizeBytes: number;       
  mimeType: string | null;    
  checksumSha256: string | null;

  createdAt: string;
  updatedAt: string;

  salesOrderByNumber?: {
    saleOrderNumber?: string;
  } | null;
}

export type MaterialFileListResponse = {
  items: MaterialFile[];
  meta: { page: number; limit: number; total: number; pages: number };
};

export type Paginated<T> = {
  items: T[];
  meta: { page: number; limit: number; total: number; pages: number };
};

export type MaterialFileQuery = {
  search?: string;
  saleOrderNumber?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'fileName' | 'ID';
  sortOrder?: 'asc' | 'desc';
};

export type CreateMaterialFileInput = {
  saleOrderNumber?: string | null;
  fileName: string;
  description?: string | null;
};

