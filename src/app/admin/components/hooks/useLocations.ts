"use client";

import { useCallback, useEffect, useState } from "react";
import type { AlertColor } from "@mui/material/Alert";
import { authFetch } from "@/common/lib/authFetch";
import { secureDownload } from "@/common/lib/secure-download";
import { API } from "@/common/lib/endpoints";
import type { LocationRow, RackLevel, UploadPreview } from "../types/admin";

type Notify = (message: string, severity?: AlertColor) => void;

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Multipart uploads use plain fetch (authFetch forces a JSON Content-Type
// and hides the BE error details we need for the preview).
const postFile = (url: string, file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return fetch(url, { method: "POST", headers: authHeader(), body: fd });
};

export function useLocations(
  showSnackbar: Notify,
  enabled: boolean,
  search: string,
) {
  const [rows, setRows] = useState<LocationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // 0-based for MUI TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // New search -> back to the first page
  useEffect(() => {
    setPage(0);
  }, [search]);

  const fetchRows = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      if (search.trim()) qs.set("search", search.trim());
      const res = await authFetch(`${API.LOCATIONS.LIST}?${qs.toString()}`);
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      const nextTotal = json.pagination?.total ?? 0;

      setRows(json.data ?? []);
      setTotal(nextTotal);

      const lastPage = Math.max(0, Math.ceil(nextTotal / rowsPerPage) - 1);

      if (page > lastPage) {
        setPage(lastPage);
      }
    } catch {
      setError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  }, [enabled, page, rowsPerPage, search]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const changeRowsPerPage = (value: number) => {
    setRowsPerPage(value);
    setPage(0);
  };

  const downloadTemplate = async () => {
    try {
      const res = await fetch(API.LOCATIONS.TEMPLATE, {
        headers: authHeader(),
      });
      if (!res.ok) throw new Error("Download failed");
      secureDownload(await res.blob(), "Location_Master_Template.xlsx");
    } catch {
      showSnackbar("Failed to download template", "error");
    }
  };
  // Imports the file directly (BE revalidates and inserts atomically)
  const importFile = async (file: File) => {
    setUploading(true);
    try {
      const res = await postFile(API.LOCATIONS.UPLOAD, file);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        // Data changed since the check -> show the BE's fresh error list
        if (json?.details?.rows) {
          setSelectedFile(file);
          setPreview(json.details as UploadPreview);
        }
        throw new Error(json?.message || "Import failed");
      }
      showSnackbar(
        `Imported ${json?.counts?.added ?? 0} new rack level(s)`,
        "success",
      );
      closePreview();
      if (page === 0) fetchRows();
      else setPage(0);
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : "Import failed",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  // User picks a file -> check it first; popup only if there are errors
  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;

    setUploading(true);
    try {
      const res = await postFile(API.LOCATIONS.UPLOAD_PREVIEW, file);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || "Failed to read the file");

      const result = json as UploadPreview;
      if (!result.canImport || result.counts.invalid > 0) {
        setSelectedFile(file);
        setPreview(result); // errors -> show the popup
        return;
      }
      if (result.counts.added === 0) {
        showSnackbar("Nothing new to import. All rows already exist.", "info");
        return;
      }
      await importFile(file); // all valid -> upload directly
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : "Failed to preview file",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const closePreview = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  const deleteLevel = async (row: RackLevel): Promise<boolean> => {
    setDeleting(true);

    try {
      const qs = new URLSearchParams({
        plantCode: row.plantCode,
        rackNumber: row.rackNumber,
      });

      const res = await authFetch(`${API.LOCATIONS.DELETE}?${qs.toString()}`, {
        method: "DELETE",
      });

      if (!res.ok) return false;

      showSnackbar("Deleted successfully", "success");

      await fetchRows();

      return true;
    } catch {
      showSnackbar("Failed to delete rack level", "error");
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    rows,
    total,
    page,
    setPage,
    rowsPerPage,
    changeRowsPerPage,
    loading,
    error,
    refresh: fetchRows,
    downloadTemplate,
    onFileSelected,
    preview,
    uploading,
    closePreview,
    deleting,
    deleteLevel,
  };
}
