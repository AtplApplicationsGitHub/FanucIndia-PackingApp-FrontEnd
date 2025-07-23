"use client";

import { getGreeting } from "@/utils/sales-helpers";
import LogoutButton from "@/components/common/LogoutButton";

type Props = {
  userName: string;
};

export default function SalesDashboardHeader({ userName }: Props) {
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

      <LogoutButton
        variant="redOutline"
        className="px-6 py-2 mr-10"
      />
    </div>
  );
}
