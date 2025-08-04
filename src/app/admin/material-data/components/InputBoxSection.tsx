"use client";

import { FC, useState } from "react";
import { TextField, Button, Box } from "@mui/material";

interface Props {
  onSubmit: (value: string) => void;
}

const InputBoxSection: FC<Props> = ({ onSubmit }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <div className="w-full flex justify-center">
      <Box
        component="form"
        onSubmit={handleSubmit}
        className="flex items-center gap-4"
      >
        <TextField
          label="Material Code"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          size="small"
          required
          sx={{ width: 300 }}
        />
        {/* <Button
        type="submit"
        variant="outlined"
        disabled={!value.trim()}
        sx={{ height: 40 }}
      >
        Submit
      </Button> */}
        <Button
          type="submit"
          disabled={!value.trim()}
          sx={{
            color: (theme) => theme.palette.text.primary,
            backgroundColor: "transparent",
            border: "none",
            boxShadow: "none",
            borderRadius: 0,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.action.hover,
              border: "none",
              boxShadow: "none",
            },
          }}
        >
          Submit
        </Button>
      </Box>
    </div>
  );
};

export default InputBoxSection;
