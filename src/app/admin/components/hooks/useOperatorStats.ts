"use client";
import { useState, useEffect } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

export interface OrderDetail {
  saleOrderNumber: string;
  outboundDelivery: string;
}

export interface OperatorStat {
  operatorName: string;
  operatorEmail: string;
  issueAssigned: OrderDetail[];    
  issueCompleted: OrderDetail[];   
  packingAssigned: OrderDetail[];  
  packingCompleted: OrderDetail[]; 
}

export function useOperatorStats(date?: string) {
  const [data, setData] = useState<OperatorStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = API.DASHBOARD.OPERATOR_STATS(date);
          
        const res = await fetchWithAuth(url);
        if (!res.ok) throw new Error("Failed to fetch operator stats");
        
        const json = await res.json();
        setData(json.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);

  return { data, loading, error };
}