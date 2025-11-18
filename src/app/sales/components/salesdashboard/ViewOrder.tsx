"use client";

import { useState } from "react";
import { Search, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useViewOrder } from "../hooks/ViewOrder";
import { Typography } from "@mui/material";

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
    <div className="bg-white rounded-lg shadow-sm p-5 h-full flex flex-col justify-between min-h-[380px] w-full">
      <div>
        <Typography
          component="h2"
          variant="body2"
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "error.main", // <-- red from MUI theme
            marginBottom: "0.25rem", // roughly matches mb-1
          }}
        >
          View Order Details
        </Typography>

        <div className="space-y-3">
          <label
            htmlFor="so-number"
            className="block text-xs font-medium text-gray-700"
          >
            Enter Sales Order Number
          </label>

          <input
            id="so-number"
            type="text"
            value={soNumber}
            onChange={(e) =>
              setSoNumber(e.target.value.toUpperCase().replace(/\s+/g, ""))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading && soNumber.trim()) {
                handleSearch();
              }
            }}
            placeholder="e.g., SO12345"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            autoFocus
          />

          {displayError && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <span></span> {displayError}
            </p>
          )}

          {showSuccess && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Order found! Redirecting...
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading || !soNumber.trim()}
        className={`w-full mt-4 py-2.5 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
          loading || !soNumber.trim()
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
            <Search className="w-4 h-4" />
            View Order Details
          </>
        )}
      </button>
    </div>
  );
}
