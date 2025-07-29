"use client";

import React from "react";
import {
  Box,
  Typography,
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
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          px: 2,
          gap: { xs: 2, md: 4 },
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          color="text.primary"
          sx={{ mb: { xs: 1, md: 0 } }}
        >
          Your Orders
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
        >
          <TextField
            variant="outlined"
            size="small"
            placeholder="SEARCH"
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
            sx={{
              color: (theme) => theme.palette.text.primary,
              "&:hover": {
                backgroundColor: (theme) => theme.palette.action.hover,
              },
              borderRadius: 0,
            }}
            onClick={onCreate}
            startIcon={<Plus size={18} />}
          >
            Create Order
          </Button>
          <Button
            sx={{
              color: (theme) => theme.palette.text.primary,
              "&:hover": {
                backgroundColor: (theme) => theme.palette.action.hover,
              },
              borderRadius: 0,
            }}
            onClick={onDownload}
            startIcon={<Download size={18} />}
          >
            Excel Template
          </Button>
          <Button
            sx={{
              color: (theme) => theme.palette.text.primary,
              "&:hover": {
                backgroundColor: (theme) => theme.palette.action.hover,
              },
              borderRadius: 0,
            }}
            onClick={onBulkUpload}
            startIcon={<UploadCloud size={18} />}
          >
            Bulk Upload
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
