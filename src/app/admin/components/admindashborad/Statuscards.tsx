// src/app/admin/components/admindashborad/Statuscards.tsx
"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { ShoppingCart, Truck, AlertTriangle } from "lucide-react";
import { useStatusCards } from "../hooks/useStatuscards";
import type { StatusCardData } from "../types/admin";


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

  return (
    <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563] hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg uppercase font-semibold text-[#4B5563] dark:text-[#E5E7EB]">
            {title}
          </p>
          <p className="text-3xl font-bold text-[#1F2933] dark:text-white mt-1">
            {value}
          </p>

          <div className="flex items-center mt-2 text-sm text-[#4B5563] dark:text-[#E5E7EB]">
            <span>vs last month</span>
            <div
              className={`flex items-center ml-3 ${
                isPositive 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-[#D00000] dark:text-red-400"
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
          className={`w-14 h-14 flex items-center justify-center rounded-xl bg-[#F7F7F7] dark:bg-[#2C3540] ${iconColor}`}
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
            className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563] animate-pulse"
          >
            <div className="h-5 bg-[#E5E7EB] dark:bg-[#2C3540] rounded w-32 mb-3" />
            <div className="h-10 bg-[#E5E7EB] dark:bg-[#2C3540] rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full text-center p-8 bg-red-50 dark:bg-red-900/30 rounded-xl text-[#D00000] dark:text-red-400 border border-red-200 dark:border-red-800">
        Something went wrong while loading your data : {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xl text-[#1F2933] dark:text-[#F7F7F7] uppercase font-semibold">
      {cards.map((card, idx) => (
        <StatCard key={idx} {...card} />
      ))}
    </div>
  );
};

export default StatusCards;