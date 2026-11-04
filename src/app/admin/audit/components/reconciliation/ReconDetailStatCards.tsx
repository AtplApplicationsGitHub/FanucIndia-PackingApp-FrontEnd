"use client";

import type { ReactNode } from "react";

import { Box } from "@mui/material";
import {
  CheckCircle2,
  Gauge,
  ListChecks,
  Package,
  ScanLine,
} from "lucide-react";

import ReconMetricCard from "./ReconMetricCard";
import AccuracyInfoCard from "./AccuracyInfoCard";

export type ReconDetailMetrics = {
  scanned: number;
  matched: number;
  totalVariances: number;
  openVariances: number;
  /** Line accuracy from the server (null = nothing to judge yet) */
  accuracy: number | null;
  /** Quantity accuracy from the server (null = nothing expected) */
  qtyAccuracy: number | null;
  /** In Progress: the numbers cover the uploaded locations only */
  partial?: boolean;
  /** Expected lines of the whole audit file (shown while partial) */
  auditExpected?: number;
};

const formatPercent = (value: number | null) =>
  value === null ? "—" : `${Math.round(value)}%`;

type Props = {
  expected: number;
  /** null / undefined = the operator has not uploaded yet -> scanned, matched ... show "-" */
  metrics?: ReconDetailMetrics | null;
  extraCard?: ReactNode;
};

/** Expected / Scanned / Matched / Accuracy / Resolved cards of one audit (reconciliation detail + planning detail). */
export default function ReconDetailStatCards({
  expected,
  metrics,
  extraCard,
}: Props) {
  const gridSx = {
    display: "grid",
    gridTemplateColumns: {
      xs: "repeat(1, minmax(0, 1fr))",
      sm: "repeat(2, minmax(0, 1fr))",
      md: "repeat(3, minmax(0, 1fr))",
      lg: `repeat(${extraCard ? 6 : 5}, minmax(0, 1fr))`,
    },
    gap: 1.5,
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
        />
        <ReconMetricCard
          title="Matched"
          value="—"
          icon={<CheckCircle2 size={18} />}
        />
        <ReconMetricCard
          title="Accuracy"
          info={<AccuracyInfoCard />}
          value="—"
          icon={<Gauge size={18} />}
        />
        <ReconMetricCard
          title="Resolved"
          value="—"
          icon={<ListChecks size={18} />}
        />
        {extraCard}
      </Box>
    );
  }

  const {
    scanned,
    matched,
    totalVariances,
    openVariances,
    accuracy,
    qtyAccuracy,
    partial,
    auditExpected,
  } = metrics;
  const resolved = totalVariances - openVariances;
  const accuracyColor =
    accuracy === null
      ? "primary"
      : accuracy >= 98
        ? "success"
        : accuracy >= 95
          ? "warning"
          : "error";
  const scanDiff = scanned - expected;

  return (
    <Box sx={gridSx}>
      {partial ? (
        <ReconMetricCard
          title="Expected"
          value={`${expected} / ${auditExpected ?? expected}`}
          icon={<Package size={18} />}
          caption="Uploaded locations only"
        />
      ) : (
        expectedCard
      )}
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
        info={<AccuracyInfoCard />}
        value={formatPercent(accuracy)}
        icon={<Gauge size={18} />}
        caption={`Qty ${formatPercent(qtyAccuracy)}`}
        progress={accuracy ?? 0}
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
      {extraCard}
    </Box>
  );
}
