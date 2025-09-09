import { useState, useEffect } from 'react';
import { API } from '@/common/lib/api';

export interface OrderHeader {
  so: string;
  customerName: string;
  transferOrder: string;
  fgObd: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Failed to load order header';
}

export function useOrderHeader(orderId: number, userId: number | null) {
  const [data, setData] = useState<OrderHeader | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId <= 0 || !userId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;

    const fetchHeader = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        
        if (!token || !userStr) {
          throw new Error("User not authenticated");
        }
        
        const user = JSON.parse(userStr);
        const userRole = user.role;

        // Determine the correct API endpoint based on the user's role
        const url = userRole === 'admin' 
          ? API.ADMIN.SALES_ORDER_BY_ID(orderId)
          : `${API.USER_DASHBOARD.ORDERS}/${orderId}`;


        const res = await fetch(url, {
          cache: 'no-cache',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch order header: ${res.statusText}`);
        }

        const json = await res.json() as {
          saleOrderNumber: string;
          customer?: { name?: string };
          transferOrder: string;
          outboundDelivery: string;
        };

        if (!cancelled) {
          setData({
            so: json.saleOrderNumber,
            customerName: json.customer?.name ?? '',
            transferOrder: json.transferOrder,
            fgObd: json.outboundDelivery,
          });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchHeader();
    return () => {
      cancelled = true;
    };
  }, [orderId, userId]);

  return { data, loading, error };
}