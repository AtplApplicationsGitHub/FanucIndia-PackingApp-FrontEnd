import { RequiredLabel } from "@/components/common/RequiredLabel";

type Props = {
  label: string;
  name: string;
  value: string;
  onChange: (field: string, value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
};

const TextInput: React.FC<Props> = ({
  label,
  name,
  value,
  onChange,
  error,
  required = true,
  placeholder,
}) => (
  <div className="flex flex-col gap-1">
    <RequiredLabel required={required}>{label}</RequiredLabel>
    <input
      type="text"
      name={name}
      value={value}
      required={required}
      onChange={e => onChange(name, e.target.value ?? "")}
      placeholder={placeholder || `Enter ${label}`}
      className={`
        w-full rounded-md border px-3 py-2 bg-background text-foreground
        dark:bg-zinc-900 dark:text-white dark:border-zinc-700
        shadow-sm text-sm transition
        focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
        ${error ? "border-red-500" : "border-input"}
      `}
      autoComplete="off"
    />
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);

export default TextInput;
