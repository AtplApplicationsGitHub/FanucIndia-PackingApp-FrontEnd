"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, Download, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  
  onCreate: () => void;
  onDownload: () => void;
  onBulkUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function SalesDashboardToolbar({
  searchValue,
  onSearchChange,
  onCreate,
  onDownload,
  onBulkUpload,
  fileInputRef,
  onFileChange,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col md:flex-row justify-between items-center mb-8 px-4 space-y-3 md:space-y-0 md:space-x-4"
    >
      <h1 className="text-3xl font-bold text-black dark:text-white mb-2 md:mb-0">
        Your Orders
      </h1>
      <div className="flex flex-col md:flex-row gap-2 md:gap-4">
        <Input
          type="text"
          placeholder="Search"
          className="border border-gray-200 dark:border-zinc-700 rounded-none px-3 py-2 bg-white dark:bg-zinc-900 text-[15px] w-full md:w-auto"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        
        <Button
          variant="ghost"
          className="rounded-none font-medium px-5 py-2"
          onClick={onCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          CREATE ORDER
        </Button>

        <Button
          variant="ghost"
          className="rounded-none font-medium px-5 py-2"
          onClick={onDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          EXCEL TEMPLATE
        </Button>

        <Button
          variant="ghost"
          className="rounded-none font-medium px-5 py-2"
          onClick={onBulkUpload}
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          BULK UPLOAD
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </motion.div>
  );
}
