"use client";

import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { X } from "lucide-react"; 

type Props = {
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  startDate: Date | null;
  onStartDateChange: (val: Date | null) => void;
  endDate: Date | null;
  onEndDateChange: (val: Date | null) => void;
  onClear: () => void;
};

export default function AdminOrdersToolbar({
  searchInput,
  onSearchInputChange,
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
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
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
            endAdornment: searchInput && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onSearchInputChange("")}
                  aria-label="Clear search"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

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
                minWidth: 170,
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
                minWidth: 170,
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
          CLEAR
        </Button>
      </Box>
    </LocalizationProvider>
  );
}