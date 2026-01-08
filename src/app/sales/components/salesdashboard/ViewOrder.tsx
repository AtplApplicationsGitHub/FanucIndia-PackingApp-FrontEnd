"use client";

import { useState } from "react";
import { Search, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useViewOrder } from "../hooks/ViewOrder";

export default function ViewOrderDetails() {
  const [soNumber, setSoNumber] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const { data, loading, error, fetchOrder } = useViewOrder();
  const router = useRouter();

  async function handleSearch() {
    setLocalError(null);
    const trimmed = soNumber.trim();
    if (!trimmed) {
      setLocalError("Please enter a valid SO number.");
      return;
    }

    try {
      const orderData = await fetchOrder(trimmed);
      if (orderData) {
        router.push(`/so-search/${encodeURIComponent(trimmed)}`);
      }
    } catch (err: unknown) {
      // Safely extract message from unknown error
      const message =
        err instanceof Error
          ? err.message
          : String(err) || "Failed to find order. Please try again.";
      setLocalError(message);
    }
  }

  const displayError = localError || error;
  const showSuccess = data && !loading && !displayError;

  return (
    <div className="bg-white dark:bg-[#1F2933] rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] h-full flex flex-col justify-between min-h-[380px] w-full transition-all">
      <div>
        <p className="text-lg uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B] mb-1">
          View Order Details
        </p>

        <div className="space-y-4 mt-6">
          <label
            htmlFor="so-number"
            className="block text-sm font-medium text-[#4B5563] dark:text-[#E5E7EB]"
          >
            Enter Sales Order Number
          </label>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading && soNumber.trim()) handleSearch();
            }}
            className="flex items-center w-full"
          >
            <div className="relative w-full">
              <input
                id="so-number"
                type="text"
                placeholder="Search"
                aria-label="search"
                value={soNumber}
                onChange={(e) =>
                  setSoNumber(e.target.value.toUpperCase().replace(/\s+/g, ""))
                }
                className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-[#2C3540] border border-[#E5E7EB] dark:border-[#4B5563] rounded-lg text-[#1F2933] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading || !soNumber.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {displayError && (
            <p className="text-sm text-[#D00000] dark:text-red-400 mt-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-red-500 rounded-full inline-block"></span>
              {displayError}
            </p>
          )}

          {showSuccess && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Order found! Redirecting...
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading || !soNumber.trim()}
        className={`w-full mt-6 py-3 px-4 rounded-lg text-sm font-semibold uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-200 ${
          loading || !soNumber.trim()
            ? "bg-gray-100 dark:bg-[#2C3540] text-gray-400 dark:text-gray-500 cursor-not-allowed border border-transparent"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg dark:bg-blue-600 dark:hover:bg-blue-500"
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Searching...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            View Order Details
          </>
        )}
      </button>
    </div>
  );
}
