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
  TextField,
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
  FreeStockReservedDays,
  FreeStockZone,
} from "../../../types/freeStock";

type Props = {
  admin: boolean;
  search: string;
  onSearch: (value: string) => void;
  onSubmitSearch: () => void;
  onClearSearch: () => void;
  zoneId: number | "";
  zones: FreeStockZone[];
  onZoneChange: (value: number | "") => void;
  reservedDays: FreeStockReservedDays;
  onReservedDaysChange: (value: FreeStockReservedDays) => void;
  onClearFilters: () => void;
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
  onSubmitSearch,
  onClearSearch,
  zoneId,
  zones,
  onZoneChange,
  reservedDays,
  onReservedDaysChange,
  onClearFilters,
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
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            onSubmitSearch();
          }}
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
              onClick={onClearSearch}
            >
              <ClearIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}

          <IconButton type="submit" sx={{ p: "5px" }} aria-label="search">
            <SearchIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <TextField
          select
          size="small"
          label="Zone"
          value={zoneId}
          slotProps={{
            select: { displayEmpty: true },
            inputLabel: { shrink: true },
          }}
          onChange={(event) =>
            onZoneChange(
              event.target.value === "" ? "" : Number(event.target.value),
            )
          }
          sx={{
            width: { xs: "100%", sm: 150 },
            "& .MuiInputBase-root": { height: 38, fontSize: 14 },
          }}
        >
          <MenuItem value="">All zones</MenuItem>
          {zones.map((zone) => (
            <MenuItem key={zone.id} value={zone.id}>
              {zone.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Reserved Days"
          value={reservedDays}
          onChange={(event) =>
            onReservedDaysChange(event.target.value as FreeStockReservedDays)
          }
          sx={{
            width: { xs: "100%", sm: 150 },
            "& .MuiInputBase-root": { height: 38, fontSize: 14 },
          }}
        >
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="0_30">0–30 days</MenuItem>
          <MenuItem value="31_90">31–90 days</MenuItem>
          <MenuItem value="OVER_90">More than 90 days</MenuItem>
        </TextField>
        {(zoneId !== "" || reservedDays !== "ALL") && (
          <Tooltip title="Clear filters">
            <IconButton
              size="small"
              aria-label="Clear reservation filters"
              onClick={onClearFilters}
            >
              <ClearIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        )}
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
            UPLOAD EXCEL
          </CommonButton>
        )}

        {!admin && (
          <>
            <CommonButton
              startIcon={<FileSpreadsheet size={17} />}
              disabled={downloading}
              onClick={() => void onDownload(true)}
            >
              DOWNLOAD TEMPLATE
            </CommonButton>

            <CommonButton
              startIcon={<Upload size={17} />}
              onClick={() => onUpload("reservation")}
            >
              UPLOAD EXCEL
            </CommonButton>
          </>
        )}

        <CommonButton
          startIcon={<Download size={17} />}
          disabled={pending || downloading || !hasData}
          onClick={() => void onDownload(false)}
        >
          {downloading ? "DOWNLOADING..." : "EXPORT EXCEL"}
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
