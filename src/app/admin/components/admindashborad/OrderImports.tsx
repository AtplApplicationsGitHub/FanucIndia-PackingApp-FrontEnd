import React, { useState } from "react";


type DayStat = {
  label: string;
  count: number;
};

export default function OrderImportsCard() {
  const [date, setDate] = useState<string>("");

  const stats: DayStat[] = [
    { label: "Today (Nov 7)", count: 12 },
    { label: "Yesterday (Nov 6)", count: 34 },
    { label: "Nov 5", count: 28 },
    { label: "Nov 4", count: 45 },
    { label: "Nov 3", count: 20 },
  ];

  function handleSearchByDate() {
    if (!date) return;
    // placeholder: wire up to your API or filter logic
    alert(`Search imports for: ${date}`);
  }

  return (
    <div className="w-100 mt-6">
      <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          New Order Imports (Last 5 Days)
        </h3>

        <ul className="mt-5 divide-y divide-slate-200 dark:divide-slate-700">
          {stats.map((s, idx) => (
            <li key={idx} className="py-4 flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">{s.label}</span>
              <span
                className={
                  "text-sm font-medium " +
                  (idx === 0 ? "text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-100")
                }
              >
                {s.count}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Check Imports by Date</p>

          <div className="flex items-center gap-2">
            <label htmlFor="date" className="sr-only">Select date</label>
            <div className="flex-1 relative">
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 px-3 pr-10 bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-100 placeholder-slate-400"
                placeholder="dd-mm-yyyy"
              />

              {/* small calendar icon inside input (right side) */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <button
              onClick={handleSearchByDate}
              className="h-10 w-10 rounded-md flex items-center justify-center bg-slate-800 dark:bg-sky-600 text-white hover:opacity-95"
              aria-label="Search by date"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
