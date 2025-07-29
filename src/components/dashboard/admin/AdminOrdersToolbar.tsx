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

type Props = {
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  searchDate: Date | null;
  onSearchDateChange: (val: Date | null) => void;
  onClear: () => void;
};

export default function AdminOrdersToolbar({
  searchInput,
  onSearchInputChange,
  searchDate,
  onSearchDateChange,
  onClear,
}: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 3 },
          width: { xs: "100%", md: "max-content" },
          mx: { xs: 0, md: "auto" },
          mb: 3,
          px: { xs: 1, md: 2 },
          alignItems: { md: "center" },
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="SEARCH"
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
          label="FILTER BY DATE"
          value={searchDate ? dayjs(searchDate) : null}
          onChange={(val) => onSearchDateChange(val ? val.toDate() : null)}
          format="DD-MM-YYYY"
          slotProps={{
            field: {
              clearable: true,
              onClear: () => onSearchDateChange(null),
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
          sx={{
            color: (theme) => theme.palette.text.primary,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.action.hover,
            },
            borderRadius: 0,
          }}
        >
          CLEAR
        </Button>
      </Box>
    </LocalizationProvider>
  );
}
