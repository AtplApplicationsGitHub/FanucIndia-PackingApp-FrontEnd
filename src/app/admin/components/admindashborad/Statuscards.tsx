"use client";

import React, { useState } from "react";
import { useDispatchSummary } from "../hooks/useDispatchSummary";
import { useErpImportCounts } from "../hooks/useErpImportCounts";
import { useBacklogCount } from "../hooks/useBacklogCount";
import { useBinCounts } from "../hooks/useBinCounts";
import BacklogOrdersDialog from "./BacklogOrdersDialog";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

interface MiniCardProps {
  title: string;
  value?: number | string | null;
  loading?: boolean;
  error?: string | null;
  accentColor?: string;
  onClick?: () => void;
  headerIcon?: React.ReactNode;
}

const MiniCard = ({
  title,
  value,
  loading,
  error,
  accentColor = "border-l-gray-300 dark:border-l-gray-600",
  onClick,
  headerIcon,
}: MiniCardProps) => (
  <div
    onClick={onClick}
    className={`relative bg-white dark:bg-[#1F2933] rounded-lg shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] border-l-4 ${accentColor} px-3 py-2.5 hover:shadow-md transition-all ${
      onClick ? "cursor-pointer hover:ring-2 hover:ring-purple-300" : ""
    }`}
  >
    <p className="text-[11px] sm:text-xs uppercase font-bold tracking-wide text-[#6B7280] dark:text-[#9CA3AF] pr-5 truncate">
      {title}
    </p>
    {error ? (
      <p className="text-xs font-semibold text-[#D00000] dark:text-[#FF6B6B] mt-1">
        Error
      </p>
    ) : (
      <p className="text-lg sm:text-xl font-bold text-[#1F2933] dark:text-white mt-1">
        {loading ? "..." : (value ?? 0)}
      </p>
    )}
    {headerIcon && <div className="absolute top-2 right-2">{headerIcon}</div>}
  </div>
);

interface StatusCardsProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const StatusCards = ({ selectedDate, onDateChange }: StatusCardsProps) => {
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
      title: "To Dispatch",
      value: dispatch?.ordersToBeDispatched,
      loading: dispatchLoading,
      error: dispatchError,
      accentColor: "border-l-blue-500 dark:border-l-blue-400",
    },
    {
      title: "Ready",
      value: dispatch?.readyForDispatchToday,
      loading: dispatchLoading,
      error: dispatchError,
      accentColor: "border-l-amber-500 dark:border-l-amber-400",
    },
    {
      title: "Dispatched",
      value: dispatch?.ordersDispatchedToday,
      loading: dispatchLoading,
      error: dispatchError,
      accentColor: "border-l-emerald-500 dark:border-l-emerald-400",
    },
    {
      title: "Awaiting",
      value: erpCounts?.PendingImport,
      loading: erpLoading,
      error: erpError,
      accentColor: "border-l-yellow-500 dark:border-l-yellow-400",
    },
    {
      title: "Imported",
      value: erpCounts?.ErpSuccessUpload,
      loading: erpLoading,
      error: erpError,
      accentColor: "border-l-green-500 dark:border-l-green-400",
    },
    {
      title: "Failed",
      value: erpCounts?.ErpImportFailed,
      loading: erpLoading,
      error: erpError,
      accentColor: "border-l-red-500 dark:border-l-red-400",
    },
  ];

  // Row 2 — Bin count breakdown (3 cards)
  const binRowCards: MiniCardProps[] = [
    {
      title: "1 Bin",
      value: binCounts?.oneBinCount,
      loading: binLoading,
      error: binError,
      accentColor: "border-l-sky-500 dark:border-l-sky-400",
    },
    {
      title: "2-3 Bins",
      value: binCounts?.twoToThreeBinCount,
      loading: binLoading,
      error: binError,
      accentColor: "border-l-indigo-500 dark:border-l-indigo-400",
    },
    {
      title: "≥ 4 Bins",
      value: binCounts?.fourPlusBinCount,
      loading: binLoading,
      error: binError,
      accentColor: "border-l-fuchsia-500 dark:border-l-fuchsia-400",
    },
    {
      title: "Backlog",
      value: backlog?.totalBacklog,
      loading: backlogLoading,
      error: backlogError,
      accentColor: "border-l-purple-500 dark:border-l-purple-400",
      onClick: () => setBacklogDialogOpen(true),
    },
  ];
  const DateCard = ({
    selectedDate,
    onDateChange,
  }: {
    selectedDate: string;
    onDateChange: (date: string) => void;
  }) => (
    <div className="relative min-w-0 bg-white dark:bg-[#1F2933] rounded-lg shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] border-l-4 border-l-teal-500 dark:border-l-teal-400 px-3 py-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] sm:text-xs uppercase font-bold tracking-wide text-[#6B7280] dark:text-[#9CA3AF] truncate">
          Dashboard Date
        </p>
      </div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={selectedDate ? dayjs(selectedDate) : null}
          onChange={(newValue) => {
            if (newValue) onDateChange(newValue.format("YYYY-MM-DD"));
          }}
          minDate={dayjs().subtract(3, "day")}
          maxDate={dayjs().add(5, "day")}
          format="DD-MM-YY"
          slots={{ openPickerIcon: CalendarMonthIcon }}
          slotProps={{
            textField: {
              variant: "standard",
              InputProps: { disableUnderline: true },
              sx: {
                mt: 0.5,
                minWidth: 0,
                "& .MuiInputBase-root": {
                  width: "100%",
                },
                "& .MuiInputBase-input": {
                  fontSize: { xs: "0.85rem", sm: "1rem", md: "1.25rem" },
                  fontWeight: 700,
                  color: (theme) => theme.palette.text.primary,
                  padding: 0,
                  width: "100%",
                },
                "& .MuiInputAdornment-root": { ml: 0.5 },
                "& .MuiIconButton-root": { p: 0.25 },
                "& .MuiSvgIcon-root": {
                  fontSize: 18,
                  color: (theme) => theme.palette.text.secondary,
                },
              },
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );

  const allCards: MiniCardProps[] = [...topRowCards, ...binRowCards];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-11 gap-3">
        <DateCard selectedDate={selectedDate} onDateChange={onDateChange} />
        {allCards.map((card, idx) => (
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
