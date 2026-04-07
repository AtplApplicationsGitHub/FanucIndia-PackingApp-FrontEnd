"use client";

import { FC, useRef } from "react";
import { Button, ButtonProps } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { UploadCloud } from "lucide-react";
import CommonButton from "@/common/components/CommonButton";

export interface UploadErpMaterialFileButtonProps {
  saleOrderNumber: string;
  onCreated: () => void;
  buttonProps?: ButtonProps;
  onOpenDialog?: () => void;
}

const UploadErpMaterialFileButton: FC<UploadErpMaterialFileButtonProps> = ({
  onCreated,
  buttonProps,
  onOpenDialog,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (onOpenDialog) {
      onOpenDialog(); 
      return;
    }
    inputRef.current?.click(); 
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onCreated();
    e.target.value = "";
  };

  const baseSx: SxProps<Theme> = (theme) => ({
    bgcolor: theme.palette.action.hover,
    color: theme.palette.text.primary,
    borderRadius: 0,
    clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
    fontWeight: 600,
    fontSize: 15,
    minWidth: 112, 
    height: 40,
    px: 3,
    textTransform: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      bgcolor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
      "& .MuiSvgIcon-root, & svg": {
        color: "#000",
      },
    },
    "& .MuiButton-startIcon": { mr: 1 },
  });

  const mergedSx: SxProps<Theme> = Array.isArray(buttonProps?.sx)
    ? [baseSx, ...buttonProps!.sx]
    : buttonProps?.sx
    ? [baseSx, buttonProps.sx]
    : [baseSx];

  return (
    <>
      <input ref={inputRef} type="file" hidden onChange={onFileChange} />
      <CommonButton
        type="button"
        onClick={openPicker}
        startIcon={<UploadCloud size={18} />}
        disableElevation
        {...buttonProps}
      >
        UPLOAD
      </CommonButton>
    </>
  );
};

export default UploadErpMaterialFileButton;
