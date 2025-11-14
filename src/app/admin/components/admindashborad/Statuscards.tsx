import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { ShoppingCart, Truck, AlertTriangle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  percentage: string;
  isPositive: boolean;
  icon: React.ReactNode;
  iconColor?: string; // tailwind text color class, e.g. "text-blue-600"
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  percentage,
  isPositive,
  icon,
  iconColor = "text-gray-700",
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        {/* TEXT PART */}
        <div>
          {/* Title now uses the same color class as the icon */}
          <p className={`text-sm font-medium ${iconColor} dark:${iconColor.replace("text-", "text-")}`}>
            {title}
          </p>

          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>

          {/* PERCENTAGE */}
          <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            <p>vs last month</p>
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

        {/* ICON on the RIGHT - wrapper applies color */}
        <div
          className={`w-14 h-14 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 ${iconColor}`}
        >
          {/* icon passed in (lucide icons respect currentColor) */}
          {icon}
        </div>
      </div>
    </div>
  );
};

const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="TOTAL SO COUNT"
        value="1,248"
        percentage="12.5%"
        isPositive={true}
        icon={<ShoppingCart className="w-7 h-7" />}
        iconColor="text-blue-600"
      />

      <StatCard
        title="DISPATCHED ORDERS"
        value="756"
        percentage="5.7%"
        isPositive={true}
        icon={<Truck className="w-7 h-7" />}
        iconColor="text-green-600"
      />

      <StatCard
        title="OVERDUE ORDERS"
        value="526"
        percentage="15.2%"
        isPositive={false}
        icon={<AlertTriangle className="w-7 h-7" />}
        iconColor="text-red-600"
      />      
    </div>
  );
};

export default DashboardStats;
