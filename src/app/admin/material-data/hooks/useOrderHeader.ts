// // hooks/useOrderHeader.ts
// import { useQuery } from '@tanstack/react-query';
// import { API } from '../../../../lib/api';

// export interface OrderHeader {
//   so: string;
//   customerName: string;
//   transferOrder: string;
//   fgObd: string;
// }

// export function useOrderHeader(orderId: number) {
//   return useQuery<OrderHeader, Error>({
//     queryKey: ['orderHeader', orderId],
//     queryFn: async () => {
//       // Get the JWT token from localStorage (adjust if you store it elsewhere)
//       const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//       const res = await fetch(API.ADMIN.SALES_ORDER_BY_ID(orderId), {
//         cache: 'no-cache',
//         headers: token ? { 'Authorization': `Bearer ${token}` } : {},
//       });
//       if (!res.ok) {
//         throw new Error(`Failed to fetch order header: ${res.statusText}`);
//       }
//       const data = await res.json();
//       return {
//         so: data.saleOrderNumber,
//         customerName: data.customer?.name ?? '',
//         transferOrder: data.transferOrder,
//         fgObd: data.outboundDelivery,
//       };
//     },
//     enabled: orderId > 0,
//   });
// }

// hooks/useOrderHeader.ts
import { useState, useEffect } from 'react';
import { API } from '../../../../lib/api';

export interface OrderHeader {
  so: string;
  customerName: string;
  transferOrder: string;
  fgObd: string;
}

export function useOrderHeader(orderId: number) {
  const [data, setData] = useState<OrderHeader | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId <= 0) {
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
        const res = await fetch(API.ADMIN.SALES_ORDER_BY_ID(orderId), {
          cache: 'no-cache',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Failed to fetch order header: ${res.statusText}`);
        const json = await res.json();
        if (!cancelled) {
          setData({
            so: json.saleOrderNumber,
            customerName: json.customer?.name ?? '',
            transferOrder: json.transferOrder,
            fgObd: json.outboundDelivery,
          });
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load order header');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchHeader();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return { data, loading, error };
}
