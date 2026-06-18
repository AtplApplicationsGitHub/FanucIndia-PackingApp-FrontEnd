"use client";

import React from "react";
import axios from "axios";
import { Dayjs } from "dayjs";
import { API } from "@/common/lib/endpoints";
import {
  EfficiencyApiRecord,
  EfficiencyRow,
  BinMetric,
} from "@/app/admin/components/types/admin";

const BIN_KEYS = ["bin1", "bin2to3", "bin4plus"] as const;
type BinKey = (typeof BIN_KEYS)[number];

type BinAccum = {
  leadSum: number;
  processSum: number;
  count: number;
};

type AggEntry = {
  operator: string;
  requiredDate: string;
  bins: Record<BinKey, BinAccum>;
};

const resolveBinKey = (bin: string): BinKey | null => {
  const normalized = bin.trim();
  if (normalized === "1") return "bin1";
  if (normalized === "2-3") return "bin2to3";
  if (normalized === "4+" || normalized === ">=4" || normalized === "4")
    return "bin4plus";
  return null;
};

const emptyMetric = (): BinMetric => ({
  leadTime: null,
  processTime: null,
  count: 0,
});

const round = (n: number) => Math.round(n * 100) / 100;

function aggregate(records: EfficiencyApiRecord[]): EfficiencyRow[] {
  const map = new Map<string, AggEntry>();

  records.forEach((rec) => {
    const binKey = resolveBinKey(rec.bin);
    if (!binKey) return;

    const date = rec.requiredDate.slice(0, 10);
    const key = `${rec.userName}||${date}`;

    if (!map.has(key)) {
      map.set(key, {
        operator: rec.userName,
        requiredDate: date,
        bins: {
          bin1: { leadSum: 0, processSum: 0, count: 0 },
          bin2to3: { leadSum: 0, processSum: 0, count: 0 },
          bin4plus: { leadSum: 0, processSum: 0, count: 0 },
        },
      });
    }

    const entry = map.get(key)!;
    entry.bins[binKey].leadSum += rec.leadTime ?? 0;
    entry.bins[binKey].processSum += rec.scanTime ?? 0;
    entry.bins[binKey].count += 1;
  });

  return Array.from(map.values())
    .map(({ operator, requiredDate, bins }) => {
      const toMetric = (b: BinAccum): BinMetric =>
        b.count === 0
          ? emptyMetric()
          : {
              leadTime: round(b.leadSum / b.count),
              processTime: round(b.processSum / b.count),
              count: b.count,
            };

      return {
        operator,
        requiredDate,
        bin1: toMetric(bins.bin1),
        bin2to3: toMetric(bins.bin2to3),
        bin4plus: toMetric(bins.bin4plus),
      };
    })
    .sort((a, b) => {
      if (a.requiredDate !== b.requiredDate)
        return a.requiredDate.localeCompare(b.requiredDate);
      return a.operator.localeCompare(b.operator);
    });
}

export function useEfficiencyReport(
  startDate: Dayjs | null,
  endDate: Dayjs | null,
  stage: "Issue" | "Packing" = "Issue",
) {
  const [rows, setRows] = React.useState<EfficiencyRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchReport = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params: Record<string, string> = {};
      if (startDate) params.from = startDate.format("YYYY-MM-DD");
      if (endDate) params.to = endDate.format("YYYY-MM-DD");
      params.stage = stage;
      const res = await axios.get<EfficiencyApiRecord[]>(
        API.ADMIN.EFFICIENCY_REPORT,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      );
      setRows(aggregate(res.data ?? []));
    } catch (err: any) {
      setError(err?.message || "Failed to load efficiency report");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, stage]);

  React.useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { rows, loading, error, refresh: fetchReport };
}
