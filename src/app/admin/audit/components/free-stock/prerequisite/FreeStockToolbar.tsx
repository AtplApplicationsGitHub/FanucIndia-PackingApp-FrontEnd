"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import {
  Box,
  Chip,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import {
  Download,
  FileSpreadsheet,
  History,
  LockKeyhole,
  Menu,
  Unlock,
  Upload,
} from "lucide-react";

import CommonButton from "@/common/components/CommonButton";
import type {
  FreeStockRow,
  FreeStockSummaryItem,
} from "../../../types/freeStock";

type Props = {
  admin: boolean;
  search: string;
  onSearch: (value: string) => void;
  selectedCount: number;
  selectedRows: FreeStockRow[];
  pending: boolean;
  downloading: boolean;
  hasData: boolean;
  onDownload: (template: boolean) => Promise<void>;
  onUpload: (mode: "stock" | "reservation") => void;
  onReserve: (rows: FreeStockRow[]) => void;
  onRelease: (rows: FreeStockRow[]) => void;
  onHistory: (open: boolean) => void;
};

export default function FreeStockToolbar({
  admin,
  search,
  onSearch,
  selectedCount,
  selectedRows,
  pending,
  downloading,
  hasData,
  onDownload,
  onUpload,
  onReserve,
  onRelease,
  onHistory,
}: Props) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const menuAction = (action: () => void) => {
    setMenuAnchor(null);
    action();
  };

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        gap={1}
      >
        <Box
          component="form"
          onSubmit={(event: FormEvent) => event.preventDefault()}
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: 230 },
            border: 1,
            borderColor: (t) =>
              t.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.23)"
                : "#e0e0e0",
            borderRadius: "4px",
            height: 38,
            bgcolor: "background.paper",
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: "14px" }}
            placeholder="Search"
            inputProps={{
              "aria-label": "search free stock",
              maxLength: 255,
            }}
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />

          {search && (
            <IconButton
              sx={{ p: "5px" }}
              aria-label="clear search"
              onClick={() => onSearch("")}
            >
              <ClearIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}

          <IconButton type="submit" sx={{ p: "5px" }} aria-label="search">
            <SearchIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {selectedCount > 0 && (
          <Chip
            size="small"
            label={`${selectedCount} selected`}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 600,
              "& .MuiChip-label": { px: 1.25 },
            }}
          />
        )}

        {admin && (
          <CommonButton
            startIcon={<Upload size={17} />}
            onClick={() => onUpload("stock")}
          >
            Upload Excel
          </CommonButton>
        )}

        {!admin && (
          <>
            <CommonButton
              startIcon={<FileSpreadsheet size={17} />}
              disabled={downloading}
              onClick={() => void onDownload(true)}
            >
              Download Template
            </CommonButton>

            <CommonButton
              startIcon={<Upload size={17} />}
              onClick={() => onUpload("reservation")}
            >
              Upload Excel
            </CommonButton>
          </>
        )}

        <CommonButton
          startIcon={<Download size={17} />}
          disabled={pending || downloading || !hasData}
          onClick={() => void onDownload(false)}
        >
          {downloading ? "Downloading..." : "Export Excel"}
        </CommonButton>

        <Tooltip title="Actions">
          <IconButton
            aria-label="Free Stock actions"
            aria-controls={menuAnchor ? "free-stock-actions" : undefined}
            aria-expanded={Boolean(menuAnchor)}
            aria-haspopup="menu"
            size="small"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <Menu size={20} />
          </IconButton>
        </Tooltip>
      </Stack>

      <MuiMenu
        id="free-stock-actions"
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {!admin && (
          <MenuItem
            disabled={
              pending ||
              !selectedRows.length ||
              !selectedRows.every((row) => row.canReserve)
            }
            onClick={() => menuAction(() => onReserve(selectedRows))}
          >
            <ListItemIcon>
              <LockKeyhole size={17} />
            </ListItemIcon>
            <ListItemText>Reserve Selected</ListItemText>
          </MenuItem>
        )}

        <MenuItem
          disabled={
            pending ||
            !selectedRows.length ||
            !selectedRows.every((row) => row.canRelease)
          }
          onClick={() => menuAction(() => onRelease(selectedRows))}
        >
          <ListItemIcon>
            <Unlock size={17} />
          </ListItemIcon>
          <ListItemText>Release Reservations</ListItemText>{" "}
        </MenuItem>

        {admin && (
          <MenuItem onClick={() => menuAction(() => onHistory(true))}>
            <ListItemIcon>
              <History size={17} />
            </ListItemIcon>
            <ListItemText>Upload History</ListItemText>
          </MenuItem>
        )}
      </MuiMenu>
    </>
  );
}
