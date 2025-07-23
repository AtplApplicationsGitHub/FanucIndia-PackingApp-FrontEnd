import { useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { LookupData } from "@/types/sales";
import { RequiredLabel } from "@/components/common/RequiredLabel";

type Product = LookupData["products"][number];

type Props = {
  value: string;
  onChange: (field: string, value: string) => void;
  options: Product[];
  error?: string;
};

const ProductSelect: React.FC<Props> = ({ value, onChange, options, error }) => {
  // Find the currently selected Product object, or null if not selected
  const selected = options.find(opt => String(opt.id) === value) || null;
  // State for search/filter
  const [query, setQuery] = useState("");

  // Filter products based on query (case-insensitive)
  const filtered =
    query === ""
      ? options
      : options.filter(opt =>
          opt.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="flex flex-col gap-1">
      <RequiredLabel>Product</RequiredLabel>
      <Combobox value={selected} onChange={option => onChange("productId", option ? String(option.id) : "")}>

        <div className="relative">
          <Combobox.Input
            className={`
              w-full rounded-md border px-3 py-2 bg-background text-foreground dark:bg-zinc-900 dark:text-white dark:border-zinc-700
              shadow-sm text-sm transition
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              ${error ? "border-red-500" : "border-input"}
            `}
            displayValue={(opt: Product) => opt ? opt.name : ""}
            onChange={e => setQuery(e.target.value)}
            placeholder="Select product"
          />
          <Combobox.Button className="absolute right-2 top-1/2 -translate-y-1/2">
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Combobox.Button>
          <Transition
            as={"div"}
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-zinc-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
              {filtered.length === 0 && query !== "" ? (
                <div className="px-4 py-2 text-muted-foreground">No results found.</div>
              ) : (
                filtered.map(opt => (
                  <Combobox.Option
                    key={opt.id}
                    value={opt}
                    className={({ active }) =>
                      `cursor-pointer select-none px-4 py-2 ${
                        active ? "bg-primary/10 text-primary" : "text-foreground dark:text-white"
                      }`
                    }
                  >
                    {opt.name}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default ProductSelect;
