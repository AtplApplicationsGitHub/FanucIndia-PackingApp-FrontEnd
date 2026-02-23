"use client";

import {
  Box,
  Button,
  IconButton,
  Paper,
  InputBase,
  FormControl, 
  Select,      
  MenuItem,    
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { X } from "lucide-react"; 
import { LookupRow } from "@/app/admin/components/types/admin"; 

const STATUS_OPTIONS = [
  "None",
  "R105",
  "W105",
  "F105",
  "Dispatched"
];

type Props = {
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  
  paymentFilter: string;
  onPaymentFilterChange: (val: string) => void;
  zoneFilter: string;
  onZoneFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  salesZones: LookupRow[];

  startDate: Date | null;
  onStartDateChange: (val: Date | null) => void;
  endDate: Date | null;
  onEndDateChange: (val: Date | null) => void;
  onClear: () => void;

  selectedIds?: number[];
  onBulkUpdate?: (userId: string | number) => Promise<void>;
  onBulkSkipIssue?: (status: boolean) => Promise<void>;
  assignableUsers?: { id: number; name: string }[];
};

export default function AdminOrdersToolbar({
  searchInput,
  onSearchInputChange,
  paymentFilter,
  onPaymentFilterChange,
  zoneFilter,
  onZoneFilterChange,
  statusFilter,
  onStatusFilterChange,
  salesZones,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClear,
  selectedIds = [],
  onBulkUpdate,
  onBulkSkipIssue,
  assignableUsers = [],
}: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 1.5, md: 1.5 },
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          py: 1,
        }}
      >
        <Paper
          elevation={0}
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: 220 },
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            height: 40,
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: "14px" }}
            placeholder="Search"
            inputProps={{ "aria-label": "search" }}
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
          />
          {searchInput && (
            <IconButton
              sx={{ p: "5px" }}
              aria-label="clear"
              onClick={() => onSearchInputChange("")}
            >
              <ClearIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
          <IconButton type="button" sx={{ p: "5px" }} aria-label="search">
            <SearchIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Paper>

        <FormControl size="small" sx={{ minWidth: 120, bgcolor: "background.paper" }}>
          <Select
            value={paymentFilter}
            displayEmpty
            onChange={(e) => onPaymentFilterChange(e.target.value)}
            sx={{ height: 40, fontSize: "14px" }}
          >
            <MenuItem value=""><em>Payment</em></MenuItem>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140, bgcolor: "background.paper" }}>
          <Select
            value={zoneFilter}
            displayEmpty
            onChange={(e) => onZoneFilterChange(e.target.value)}
            sx={{ height: 40, fontSize: "14px" }}
          >
            <MenuItem value=""><em>Sales Zone</em></MenuItem>
            {salesZones.map((zone) => (
              <MenuItem key={zone.id} value={String(zone.id)}>
                {String(zone.name || zone.code || zone.id)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140, bgcolor: "background.paper" }}>
          <Select
            value={statusFilter}
            displayEmpty
            onChange={(e) => onStatusFilterChange(e.target.value)}
            sx={{ height: 40, fontSize: "14px" }}
          >
            <MenuItem value=""><em>Status</em></MenuItem>
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePicker
          label="From"
          value={startDate ? dayjs(startDate) : null}
          onChange={(val) => onStartDateChange(val ? val.toDate() : null)}
          format="DD-MM-YYYY"
          slotProps={{
            field: { clearable: true, onClear: () => onStartDateChange(null) },
            textField: {
              size: "small",
              variant: "outlined",
              sx: {
                minWidth: 140,
                bgcolor: "background.paper",
                "& .MuiInputBase-root": { height: 40, fontSize: "14px" },
              },
            },
          }}
        />

        <DatePicker
          label="To"
          value={endDate ? dayjs(endDate) : null}
          onChange={(val) => onEndDateChange(val ? val.toDate() : null)}
          format="DD-MM-YYYY"
          minDate={startDate ? dayjs(startDate) : undefined}
          slotProps={{
            field: { clearable: true, onClear: () => onEndDateChange(null) },
            textField: {
              size: "small",
              variant: "outlined",
              sx: {
                minWidth: 140,
                bgcolor: "background.paper",
                "& .MuiInputBase-root": { height: 40, fontSize: "14px" },
              },
            },
          }}
        />

        <Button
          onClick={onClear}
          startIcon={<X size={16} />}
          sx={{
            bgcolor: "#eeeeee",
            color: "#333",
            borderRadius: "4px",
            fontWeight: 700,
            fontSize: "13px",
            height: 40,
            px: 2,
            textTransform: "none",
            border: "1px solid #e0e0e0",
            "&:hover": {
              bgcolor: (theme) => theme.palette.primary.main,
              color: "#000",
            },
          }}
        >
          CLEAR
        </Button>

        {selectedIds.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, ml: "auto" }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value="placeholder"
                displayEmpty
                onChange={async (e) => {
                  const userId = e.target.value;
                  if (userId && userId !== "placeholder" && onBulkUpdate) {
                    await onBulkUpdate(userId);
                  }
                }}
                sx={{
                  height: 40,
                  borderRadius: "50px",
                  bgcolor: "#fdf7e7",
                  border: "1px solid #ffd600",
                  fontSize: "13px",
                  fontWeight: 600,
                  "& .MuiSelect-select": { py: 0, px: 2 },
                  "& fieldset": { border: "none" },
                }}
              >
                <MenuItem value="placeholder" disabled>
                  Assign {selectedIds.length} orders to...
                </MenuItem>
                <MenuItem value="unassign"><em>Unassigned</em></MenuItem>
                {assignableUsers.map((u: { id: number; name: string }) => (
                  <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value="placeholder"
                displayEmpty
                onChange={async (e) => {
                  const val = e.target.value as string;
                  if (val === "true" || val === "false") {
                    if (onBulkSkipIssue) await onBulkSkipIssue(val === "true");
                  }
                }}
                sx={{
                  height: 40,
                  borderRadius: "50px",
                  bgcolor: "#e3f2fd",
                  border: "1px solid #90caf9",
                  fontSize: "13px",
                  fontWeight: 600,
                  "& .MuiSelect-select": { py: 0, px: 2 },
                  "& fieldset": { border: "none" },
                }}
              >
                <MenuItem value="placeholder" disabled>
                  Set Skip Issue Stage...
                </MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}