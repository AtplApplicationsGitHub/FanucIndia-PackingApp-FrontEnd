"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserDashboardView } from "../hooks/useUserDashboard";

import StatsCards from "./UserDashboard/TopSatusCards";
import UserOrderImports from "./UserDashboard/UserOrderImports";
import UserDispatch from "./UserDashboard/UserDispatch";
import UserPieChart from "./UserDashboard/UserPieChart";
import UserRecentActivity from "./UserDashboard/UserRecentActivity";

interface Props {
  userName: string;
  setView: (view: UserDashboardView) => void;
}

export default function UserDashboard({ userName: _userName, setView: _setView }: Props) {
  return (
    <div className="py-6 md:py-8">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatsCards />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="h-full">
              <UserOrderImports />
            </div>
            <div className="h-full">
              <UserDispatch />
            </div>
            <div className="h-full">
              <UserPieChart />
            </div>
          </div>
          <div className="mt-8">
            <UserRecentActivity />
          </div>

        </motion.div>
      </div>
    </div>
  );
}