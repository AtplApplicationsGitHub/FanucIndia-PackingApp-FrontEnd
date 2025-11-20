"use client";

import React from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { Plus, Download, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  onDownload: () => void;
  onBulkUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function SalesDashboardToolbar({
  searchValue,
  onSearchChange,
  onCreate,
  onDownload,
  onBulkUpload,
  fileInputRef,
  onFileChange,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          alignItems: "center",
          mb: 1,
          px: 2,
          gap: { xs: 2, md: 4 },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
        >
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: 200,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchValue && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onSearchChange("")}
                    aria-label="Clear search"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            onClick={onCreate}
            startIcon={<Plus size={18} />}
            sx={{
              bgcolor: (theme) => theme.palette.action.hover,
              color: (theme) => theme.palette.text.primary,
              borderRadius: 0,
              clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
              fontWeight: 600,
              fontSize: 15,
              minWidth: 120,
              height: 40,
              px: 3,
              textTransform: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
                "& .MuiSvgIcon-root, & svg": {
                  color: "#000",
                },
              },
            }}
          >
            CREATE ORDER
          </Button>

          <Button
            onClick={onDownload}
            startIcon={<Download size={18} />}
            sx={{
              bgcolor: (theme) => theme.palette.action.hover,
              color: (theme) => theme.palette.text.primary,
              borderRadius: 0,
              clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
              fontWeight: 600,
              fontSize: 15,
              minWidth: 120,
              height: 40,
              px: 3,
              textTransform: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
                "& .MuiSvgIcon-root, & svg": {
                  color: "#000",
                },
              },
            }}
          >
            EXCEL TEMPLATE
          </Button>

          <Button
            onClick={onBulkUpload}
            startIcon={<UploadCloud size={18} />}
            sx={{
              bgcolor: (theme) => theme.palette.action.hover,
              color: (theme) => theme.palette.text.primary,
              borderRadius: 0,
              clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
              fontWeight: 600,
              fontSize: 15,
              minWidth: 120,
              height: 40,
              px: 3,
              textTransform: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
                "& .MuiSvgIcon-root, & svg": {
                  color: "#000",
                },
              },
            }}
          >
            BULK UPLOAD
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={onFileChange}
            hidden
          />
        </Stack>
      </Box>
    </motion.div>
  );
}