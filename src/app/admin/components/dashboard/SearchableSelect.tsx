import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

interface SearchableSelectProps {
  label: string;
  options: { value: any; label: string }[];
  value: any;
  onChange: (value: any) => void;
  name: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  name,
}) => {
  const selectedOption =
    options.find((option) => option.value === value) || null;

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      value={selectedOption}
      onChange={(_, newValue) => {
        onChange(newValue ? newValue.value : '');
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} name={name} />
      )}
    />
  );
};

export default SearchableSelect;
