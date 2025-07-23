import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { RequiredLabel } from "@/components/common/RequiredLabel";

type Props = {
  value: string;
  onChange: (field: string, value: string) => void;
  error?: string;
};

const DeliveryDatePicker: React.FC<Props> = ({ value, onChange, error }) => {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : null;

  // Today at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Year range: current year to +50 years
  const currentYear = today.getFullYear();
  const maxYear = currentYear + 50;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange("deliveryDate", date.toISOString());
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <RequiredLabel>Required Date of Delivery</RequiredLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full rounded-md border px-3 py-2 text-left text-sm shadow-sm flex items-center"
          >
            <span className="flex-1">
              {date ? (
                format(date, "dd-MMM-yyyy")
              ) : (
                <span className="text-muted-foreground">Pick a date</span>
              )}
            </span>
            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={handleSelect}
            disabled={(date) => date < today}
            captionLayout="dropdown"
            fromYear={currentYear}
            toYear={maxYear}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default DeliveryDatePicker;
