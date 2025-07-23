"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

type Props = {
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  searchDate: Date | undefined;
  onSearchDateChange: (val: Date | undefined) => void;
  onClear: () => void;
};

const AdminOrdersToolbar: React.FC<Props> = ({
  searchInput,
  onSearchInputChange,
  searchDate,
  onSearchDateChange,
  onClear,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto mb-8 px-4">
      <Input
        type="text"
        placeholder="Search Product"
        className="border border-gray-200 dark:border-zinc-700 rounded-none px-3 py-2 bg-white dark:bg-zinc-900 text-[15px] w-full md:w-auto"
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`
              w-full md:w-auto justify-start text-left
              font-normal bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white
              border border-gray-200 dark:border-zinc-700
              px-3 py-2
              ${searchDate ? "" : "text-muted-foreground"}
              rounded-none
            `}
            aria-label="Select date"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {searchDate ? (
              format(searchDate, "dd-MM-yyyy")
            ) : (
              <span>Filter by Date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 bg-white dark:bg-zinc-900 rounded-none w-auto">
          <Calendar
            mode="single"
            selected={searchDate}
            onSelect={(date) => {
              onSearchDateChange(date);
              setOpen(false);
            }}
            className="bg-white dark:bg-zinc-900 text-black dark:text-white"
            initialFocus
          />
          {searchDate && (
            <div className="flex justify-end p-2">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-none"
                onClick={() => onSearchDateChange(undefined)}
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        onClick={onClear}
        className="ml-1 px-5 py-2 rounded-none"
      >
        CLEAR
      </Button>
    </div>
  );
};

export default AdminOrdersToolbar;
