"use client";

import { FC, useRef } from "react";
import { Button, ButtonProps } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { UploadCloud } from "lucide-react";

export interface UploadErpMaterialFileButtonProps {
  saleOrderNumber: string;
  onCreated: () => void;
  buttonProps?: ButtonProps;
  onOpenDialog?: () => void;
}

const UploadErpMaterialFileButton: FC<UploadErpMaterialFileButtonProps> = ({
  saleOrderNumber,
  onCreated,
  buttonProps,
  onOpenDialog,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (onOpenDialog) {
      onOpenDialog(); // prefer opening the dialog
      return;
    }
    inputRef.current?.click(); // fallback: old behavior
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // … your upload flow using `saleOrderNumber` + `file`
    onCreated();
    e.target.value = ""; // reset so same-file reselect works
  };

  // Base styles for the button
  const baseSx: SxProps<Theme> = (theme) => ({
    color: theme.palette.text.primary,
    "&:hover": { backgroundColor: theme.palette.action.hover },
    borderRadius: 0,
    minHeight: 40,
    whiteSpace: "nowrap",
    px: 2,
    "& .MuiButton-startIcon": { mr: 1 },
    minWidth: 112,
  });

  const mergedSx: SxProps<Theme> = Array.isArray(buttonProps?.sx)
    ? [baseSx, ...buttonProps!.sx]
    : buttonProps?.sx
    ? [baseSx, buttonProps.sx]
    : [baseSx];

  return (
    <>
      <input ref={inputRef} type="file" hidden onChange={onFileChange} />
      <Button
        type="button"
        onClick={openPicker}
        startIcon={<UploadCloud size={18} />}
        disableElevation
        {...buttonProps}
        sx={mergedSx}
      >
        Upload
      </Button>
    </>
  );
};

export default UploadErpMaterialFileButton;
