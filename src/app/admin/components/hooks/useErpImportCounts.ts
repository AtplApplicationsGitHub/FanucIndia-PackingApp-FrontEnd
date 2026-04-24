import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints"; 

interface ErpImportCounts {
    PendingImport: number;
    ErpSuccessUpload: number;
    ErpImportFailed: number;
}

export const useErpImportCounts = (date?: string) => {
    const [data, setData] = useState<ErpImportCounts | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCounts = async () => {
        try {
            setLoading(true);
            const url = API.DASHBOARD.ADMIN_ERP_IMPORT_COUNTS(date);
            const res = await fetchWithAuth(url);
            if (!res.ok) throw new Error("Failed to fetch ERP import counts");
            const json = await res.json();
            setData(json);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCounts();
    }, [date]); // re-fetches whenever date changes

    return { data, loading, error, refetch: fetchCounts };
};