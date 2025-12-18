"use client";

import {
  Box,
  Button,
  IconButton,
  Paper,
  InputBase,
  FormControl, 
  InputLabel,  
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
}: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 2 },
          width: { xs: "100%", md: "auto" },
          mx: { xs: 0, md: "auto" },
          px: { xs: 1, md: 2 },
          alignItems: { md: "center" },
          flexWrap: "wrap", 
        }}
      >
        <Paper
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{ 
            p: '2px 4px', 
            display: 'flex', 
            alignItems: 'center', 
            width: { xs: "100%", sm: 220 } 
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search"
            inputProps={{ 'aria-label': 'search' }}
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
          />
          {searchInput && (
            <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={() => onSearchInputChange("")}>
              <ClearIcon />
            </IconButton>
          )}
          <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>

        <FormControl size="small" sx={{ minWidth: 130, bgcolor: "background.paper", borderRadius: 1 }}>
          <InputLabel>Payment</InputLabel>
          <Select
            value={paymentFilter}
            label="Payment"
            onChange={(e) => onPaymentFilterChange(e.target.value)}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150, bgcolor: "background.paper", borderRadius: 1 }}>
          <InputLabel>Sales Zone</InputLabel>
          <Select
            value={zoneFilter}
            label="Sales Zone"
            onChange={(e) => onZoneFilterChange(e.target.value)}
          >
            <MenuItem value=""><em>All Zones</em></MenuItem>
            {salesZones.map((zone) => (
              <MenuItem key={zone.id} value={String(zone.id)}>
                {String(zone.name || zone.code || zone.id)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150, bgcolor: "background.paper", borderRadius: 1 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <MenuItem value=""><em>All Statuses</em></MenuItem>
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
            field: {
              clearable: true,
              onClear: () => onStartDateChange(null),
            },
            textField: {
              size: "small", 
              variant: "outlined",
              sx: {
                minWidth: 150, 
                bgcolor: "background.paper",
                "& .MuiOutlinedInput-root": { borderRadius: 1 },
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
            field: {
              clearable: true,
              onClear: () => onEndDateChange(null),
            },
            textField: {
              size: "small", 
              variant: "outlined",
              sx: {
                minWidth: 150, 
                bgcolor: "background.paper",
                "& .MuiOutlinedInput-root": { borderRadius: 1 },
              },
            },
          }}
        />

        <Button
          onClick={onClear}
          startIcon={<X size={18} />}
          sx={{
            bgcolor: (theme) => theme.palette.action.hover,
            color: (theme) => theme.palette.text.primary,
            borderRadius: 0,
            clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
            fontWeight: 600,
            fontSize: 15,
            minWidth: 100, 
            height: 40,
            px: 2,
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
          CLEAR
        </Button>
      </Box>
    </LocalizationProvider>
  );
}