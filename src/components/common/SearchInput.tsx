// src/components/common/SearchInput.tsx
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const SearchInput: React.FC<Props> = ({ value, onChange, placeholder }) => (
  <Input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder ?? "Search..."}
    className="w-full sm:w-64"
  />
);

export default SearchInput;
