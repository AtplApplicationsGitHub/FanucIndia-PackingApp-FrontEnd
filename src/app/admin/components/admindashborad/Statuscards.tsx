"use client";

import React, { useState } from "react";
import { useDispatchSummary } from "../hooks/useDispatchSummary";
import { useErpImportCounts } from "../hooks/useErpImportCounts";
import { useBacklogCount } from "../hooks/useBacklogCount";
import { useBinCounts } from "../hooks/useBinCounts";
import BacklogOrdersDialog from "./BacklogOrdersDialog";

interface MiniCardProps {
  title: string;
  value?: number | string | null;
  loading?: boolean;
  error?: string | null;
  accentColor?: string;
  onClick?: () => void;
}

const MiniCard = ({
  title,
  value,
  loading,
  error,
  accentColor = "border-l-gray-300 dark:border-l-gray-600",
  onClick,
}: MiniCardProps) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-[#1F2933] rounded-lg shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] border-l-4 ${accentColor} px-3 py-2.5 hover:shadow-md transition-all ${
      onClick ? "cursor-pointer hover:ring-2 hover:ring-purple-300" : ""
    }`}
  >
    <p className="text-[11px] sm:text-xs uppercase font-bold tracking-wide text-[#6B7280] dark:text-[#9CA3AF] truncate">
      {title}
    </p>
    {error ? (
      <p className="text-xs font-semibold text-[#D00000] dark:text-red-400 mt-1">
        Error
      </p>
    ) : (
      <p className="text-lg sm:text-xl font-bold text-[#1F2933] dark:text-white mt-1">
        {loading ? "..." : value ?? 0}
      </p>
    )}
  </div>
);

interface StatusCardsProps {
  selectedDate: string;
}

const StatusCards = ({ selectedDate }: StatusCardsProps) => {
  const {
    data: dispatch,
    loading: dispatchLoading,
    error: dispatchError,
  } = useDispatchSummary(selectedDate);

  const {
    data: erpCounts,
    loading: erpLoading,
    error: erpError,
  } = useErpImportCounts(selectedDate);

  const {
    data: backlog,
    loading: backlogLoading,
    error: backlogError,
  } = useBacklogCount(selectedDate);

  const {
    data: binCounts,
    loading: binLoading,
    error: binError,
  } = useBinCounts(selectedDate);

  const [backlogDialogOpen, setBacklogDialogOpen] = useState(false);

  // Row 1 — 7 cards
  const topRowCards: MiniCardProps[] = [
    {
      title: "To Be Dispatched",
      value: dispatch?.ordersToBeDispatched,
      loading: dispatchLoading,
      error: dispatchError,
      accentColor: "border-l-blue-500",
    },
    {
      title: "Ready to Dispatch",
      value: dispatch?.readyForDispatchToday,
      loading: dispatchLoading,
      error: dispatchError,
      accentColor: "border-l-amber-500",
    },
    {
      title: "Dispatched Today",
      value: dispatch?.ordersDispatchedToday,
      loading: dispatchLoading,
      error: dispatchError,
      accentColor: "border-l-emerald-500",
    },
    {
      title: "Backlog Orders",
      value: backlog?.totalBacklog,
      loading: backlogLoading,
      error: backlogError,
      accentColor: "border-l-purple-500",
      onClick: () => setBacklogDialogOpen(true),
    },
    {
      title: "Awaiting for Import",
      value: erpCounts?.PendingImport,
      loading: erpLoading,
      error: erpError,
      accentColor: "border-l-yellow-500",
    },
    {
      title: "ERP Import Successful",
      value: erpCounts?.ErpSuccessUpload,
      loading: erpLoading,
      error: erpError,
      accentColor: "border-l-green-500",
    },
    {
      title: "ERP Import Failed",
      value: erpCounts?.ErpImportFailed,
      loading: erpLoading,
      error: erpError,
      accentColor: "border-l-red-500",
    },
  ];

  // Row 2 — Bin count breakdown (3 cards)
  const binRowCards: MiniCardProps[] = [
    {
      title: "Orders with 1 Bin",
      value: binCounts?.oneBinCount,
      loading: binLoading,
      error: binError,
      accentColor: "border-l-sky-500",
    },
    {
      title: "Orders with 2-3 Bins",
      value: binCounts?.twoToThreeBinCount,
      loading: binLoading,
      error: binError,
      accentColor: "border-l-indigo-500",
    },
    {
      title: "Orders with 4+ Bins",
      value: binCounts?.fourPlusBinCount,
      loading: binLoading,
      error: binError,
      accentColor: "border-l-fuchsia-500",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {topRowCards.map((card, idx) => (
          <MiniCard key={idx} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {binRowCards.map((card, idx) => (
          <MiniCard key={idx} {...card} />
        ))}
      </div>

      <BacklogOrdersDialog
        open={backlogDialogOpen}
        onClose={() => setBacklogDialogOpen(false)}
        breakdown={backlog?.breakdown ?? []}
      />
    </div>
  );
};

export default StatusCards;