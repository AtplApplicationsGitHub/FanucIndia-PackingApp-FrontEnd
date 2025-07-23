// src/components/forms/SalesEntry/CustomerSelect.tsx
"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { LookupData } from "@/types/sales";
import { RequiredLabel } from "@/components/common/RequiredLabel";

type Customer = LookupData["customers"][number];

type Props = {
  value: string;
  onChange: (field: string, value: string) => void;
  options: Customer[];
  error?: string;
};

const CustomerSelect: React.FC<Props> = ({
  value,
  onChange,
  options,
  error,
}) => {
  // find the selected option object
  const selected = options.find((opt) => String(opt.id) === value) || null;

  return (
    <div className="flex flex-col gap-1">
      <RequiredLabel>Customer</RequiredLabel>
      <Listbox
        value={selected}
        onChange={(option) =>
          onChange("customerId", option ? String(option.id) : "")
        }
      >
        <div className="relative">
          <Listbox.Button
            className={`
              w-full rounded-md border px-3 py-2 bg-background text-foreground
              dark:bg-zinc-900 dark:text-white dark:border-zinc-700
              shadow-sm text-sm transition text-left
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              ${error ? "border-red-500" : "border-input"}
            `}
          >
            <span className={selected ? "" : "text-muted-foreground"}>
              {selected ? selected.name : "Select customer"}
            </span>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="
                absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-zinc-900
                shadow-lg ring-1 ring-black ring-opacity-5 max-h-60 py-1 text-sm
              "
            >
              {options.map((opt) => (
                <Listbox.Option
                  key={opt.id}
                  value={opt}
                  className={({ active }) =>
                    `cursor-pointer select-none px-4 py-2 ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground dark:text-white"
                    }`
                  }
                >
                  {opt.name}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default CustomerSelect;
