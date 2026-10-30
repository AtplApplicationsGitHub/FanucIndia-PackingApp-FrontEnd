"use client";

import { Box } from "@mui/material";
import {
  CheckCircle2,
  Gauge,
  ListChecks,
  Package,
  ScanLine,
} from "lucide-react";

import ReconMetricCard from "./ReconMetricCard";
import { getAccuracy } from "../../utils/reconLabels";

export type ReconDetailMetrics = {
  scanned: number;
  matched: number;
  totalVariances: number;
  openVariances: number;
};

type Props = {
  expected: number;
  /** null / undefined = the operator has not uploaded yet -> scanned, matched ... show "-" */
  metrics?: ReconDetailMetrics | null;
};

const PENDING = "Awaiting operator upload";

/** Expected / Scanned / Matched / Accuracy / Resolved cards of one audit (reconciliation detail + planning detail). */
export default function ReconDetailStatCards({ expected, metrics }: Props) {
  const gridSx = {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      lg: "repeat(5, 1fr)",
    },
    gap: 2,
  };

  const expectedCard = (
    <ReconMetricCard
      title="Expected"
      value={expected}
      icon={<Package size={18} />}
      caption="Material lines in the audit file"
    />
  );

  if (!metrics) {
    return (
      <Box sx={gridSx}>
        {expectedCard}
        <ReconMetricCard
          title="Scanned"
          value="—"
          icon={<ScanLine size={18} />}
          caption={PENDING}
        />
        <ReconMetricCard
          title="Matched"
          value="—"
          icon={<CheckCircle2 size={18} />}
          caption={PENDING}
        />
        <ReconMetricCard
          title="Accuracy"
          value="—"
          icon={<Gauge size={18} />}
          caption={PENDING}
        />
        <ReconMetricCard
          title="Resolved"
          value="—"
          icon={<ListChecks size={18} />}
          caption={PENDING}
        />
      </Box>
    );
  }

  const { scanned, matched, totalVariances, openVariances } = metrics;
  const resolved = totalVariances - openVariances;
  const accuracy = getAccuracy(matched, expected);
  const accuracyColor =
    accuracy >= 98 ? "success" : accuracy >= 95 ? "warning" : "error";
  const scanDiff = scanned - expected;

  return (
    <Box sx={gridSx}>
      {expectedCard}
      <ReconMetricCard
        title="Scanned"
        value={scanned}
        icon={<ScanLine size={18} />}
        caption={`${scanDiff > 0 ? "+" : ""}${scanDiff} vs expected`}
      />
      <ReconMetricCard
        title="Matched"
        value={matched}
        icon={<CheckCircle2 size={18} />}
        caption={`${expected - matched} not matched`}
      />
      <ReconMetricCard
        title="Accuracy"
        value={`${accuracy.toFixed(1)}%`}
        icon={<Gauge size={18} />}
        progress={accuracy}
        progressColor={accuracyColor}
      />
      <ReconMetricCard
        title="Resolved"
        value={`${resolved} / ${totalVariances}`}
        icon={<ListChecks size={18} />}
        progress={totalVariances ? (resolved / totalVariances) * 100 : 100}
        progressColor="success"
        caption={`${openVariances} open`}
      />
    </Box>
  );
}
