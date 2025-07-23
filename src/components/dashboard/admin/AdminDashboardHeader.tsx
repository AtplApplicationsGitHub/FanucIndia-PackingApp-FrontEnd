"use client";

import React from "react";
import clsx from "clsx";
import LogoutButton from "@/components/common/LogoutButton";
import { Button } from "@/components/ui/button";
import { Home, ClipboardList, Database, Users } from "lucide-react";
import { getGreeting } from "@/utils/sales-helpers";

type Props = {
  userName: string;
  view: "" | "orders" | "master" | "manage";
  setView: React.Dispatch<
    React.SetStateAction<"" | "orders" | "master" | "manage">
  >;
};

export default function AdminDashboardHeader({
  userName,
  view,
  setView,
}: Props) {
  return (
    <div className="w-full flex justify-between items-center py-4 px-8 bg-white dark:bg-zinc-900 shadow">
      <span className="text-lg font-semibold">
        {getGreeting()}
        {userName && (
          <>
            , <span className="text-blue-600 dark:text-blue-400">{userName}</span>
          </>
        )}
      </span>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className={clsx(
            "rounded-none font-medium px-5 py-2",
            view === "" && "bg-blue-50 dark:bg-blue-900 font-bold",
            "text-blue-600 dark:text-blue-400"
          )}
          onClick={() => setView("")}
        >
          <Home className="mr-2 h-4 w-4" />
          HOME
        </Button>

        <Button
          variant="ghost"
          className={clsx(
            "rounded-none font-medium px-5 py-2",
            view === "orders" && "bg-blue-50 dark:bg-blue-900 font-bold",
            "text-blue-600 dark:text-blue-400"
          )}
          onClick={() => setView("orders")}
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          ORDER LIST
        </Button>

        <Button
          variant="ghost"
          className={clsx(
            "rounded-none font-medium px-5 py-2",
            view === "master" && "bg-blue-50 dark:bg-blue-900 font-bold",
            "text-blue-600 dark:text-blue-400"
          )}
          onClick={() => setView("master")}
        >
          <Database className="mr-2 h-4 w-4" />
          MASTER
        </Button>

        <Button
          variant="ghost"
          className={clsx(
            "rounded-none font-medium px-5 py-2",
            view === "manage" && "bg-blue-50 dark:bg-blue-900 font-bold",
            "text-blue-600 dark:text-blue-400"
          )}
          onClick={() => setView("manage")}
        >
          <Users className="mr-2 h-4 w-4" />
          MANAGE
        </Button>

        <LogoutButton
          variant="redOutline"
          className="px-6 py-2 mr-10"
        />
      </div>
    </div>
  );
}
