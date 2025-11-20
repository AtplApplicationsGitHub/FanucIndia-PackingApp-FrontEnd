// src/app/admin/components/admindashborad/Statuscards.tsx
"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { ShoppingCart, Truck, AlertTriangle } from "lucide-react";
import { useStatusCards } from "../hooks/useStatuscards";
import type { StatusCardData } from "../types/admin";
import { useTheme } from "@mui/material";

const iconMap: Record<StatusCardData["iconType"], React.ReactNode> = {
  cart: <ShoppingCart className="w-7 h-7" />,
  truck: <Truck className="w-7 h-7" />,
  alert: <AlertTriangle className="w-7 h-7" />,
};

const StatCard = ({
  title,
  value,
  percentage,
  isPositive,
  iconType,
  iconColor,
}: StatusCardData) => {
  const theme = useTheme();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p 
            className="text-lg uppercase font-semibold"
            style={{ color: theme.palette.secondary.main }}
          >
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>

          <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>vs last month</span>
            <div
              className={`flex items-center ml-3 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
              <span className="ml-1 font-medium">{percentage}</span>
            </div>
          </div>
        </div>

        <div
          className={`w-14 h-14 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 ${iconColor}`}
        >
          {iconMap[iconType]}
        </div>
      </div>
    </div>
  );
};

const StatusCards = () => {
  const { cards, loading, error } = useStatusCards();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border animate-pulse"
          >
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full text-center p-8 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600">
        Something went wrong while loading your data : {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6  text-xl  text-slate-800 dark:text-slate-100 uppercase font-semibold ">
      {cards.map((card, idx) => (
        <StatCard key={idx} {...card} />
      ))}
    </div>
  );
};

export default StatusCards;