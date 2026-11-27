"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  alpha,
  Box,
  Checkbox,
  CircularProgress,
  IconButton,
  InputBase,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PrintIcon from "@mui/icons-material/Print";

import CommonButton from "@/common/components/CommonButton";
import { useIbdUploadRows } from "../../hooks/ibd/useIbdUploadRows";
import IbdPrintDialog from "./IbdPrintDialog";
import type { IbdRow } from "../../types/ibd";

const COLUMNS: { label: string; value: (r: IbdRow) => string | number | null }[] =
  [
    { label: "EXCEL ROW", value: (r) => r.rowNumber },
    { label: "INBOUND DELIVERY", value: (r) => r.inboundDelivery },
    { label: "MATERIAL NUMBER", value: (r) => r.materialNumber },
    { label: "MATERIAL DESCRIPTION", value: (r) => r.materialDescription },
    { label: "CUSTOMER NAME", value: (r) => r.customerName },
    { label: "CUSTOMER M", value: (r) => r.customerM },
    { label: "FIL PURCHASE", value: (r) => r.filPurchase },
    { label: "FJ OA NUMBER", value: (r) => r.fjOaNumber },
    { label: "FJ INVOICE", value: (r) => r.fjInvoice },
    { label: "INVOICE DATE", value: (r) => r.invoiceDate },
    { label: "CASE NUMBER", value: (r) => r.caseNumber },
    { label: "FIL SO NUMBER", value: (r) => r.filSoNumber },
    { label: "WEIGHT (KG)", value: (r) => r.weightKg },
  ];

export default function IbdUploadDetailScreen() {
  const theme = useTheme();
  const { uploadId: uploadIdParam } = useParams<{ uploadId: string }>();
  const uploadId = Number(uploadIdParam);

  const {
    upload,
    rows,
    pagination,
    params,
    loading,
    selected,
    updateParams,
    toggleRow,
    togglePage,
    clearSelection,
  } = useIbdUploadRows(uploadId);

  const [searchInput, setSearchInput] = useState(params.search);
  const [printOpen, setPrintOpen] = useState(false);

  const pageSelectedCount = rows.filter((r) => selected.has(r.id)).length;
  const allOnPage = rows.length > 0 && pageSelectedCount === rows.length;
  const someOnPage = pageSelectedCount > 0 && !allOnPage;

  const headCellSx = {
    fontWeight: 700,
    color: theme.palette.primary.contrastText,
    whiteSpace: "nowrap" as const,
  };
  const colSpan = COLUMNS.length + 1;

  return (
    <Box sx={{ width: "100%" }}>
      {/* TOOLBAR: search + print */}
      <Box sx={{ px: 2, pt: 0, pb: 2, mt: -1 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Paper
            elevation={0}
            sx={(t) => ({
              width: "fit-content",
              maxWidth: "100%",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: 2,
              border: `1px solid ${t.palette.divider}`,
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
              bgcolor: "background.paper",
            })}
          >
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                updateParams({
                  search: searchInput.trim().replace(/\s+/g, " "),
                  page: 1,
                });
              }}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 280 },
                border: 1,
                borderColor: (t) =>
                  t.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.23)"
                    : "#e0e0e0",
                borderRadius: "4px",
                height: 40,
                bgcolor: "background.paper",
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, fontSize: "14px" }}
                placeholder="Search rows"
                inputProps={{ "aria-label": "search rows" }}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <IconButton
                  sx={{ p: "5px" }}
                  aria-label="clear search"
                  onClick={() => {
                    setSearchInput("");
                    updateParams({ search: "", page: 1 });
                  }}
                >
                  <ClearIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
              <IconButton type="submit" sx={{ p: "5px" }} aria-label="search">
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            <CommonButton
              onClick={() => setPrintOpen(true)}
              disabled={pagination.total === 0}
              startIcon={<PrintIcon />}
            >
              PRINT{selected.size ? ` (${selected.size})` : ""}
            </CommonButton>

            {selected.size > 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={clearSelection}
              >
                Clear selection
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {/* TABLE */}
      <Box sx={{ px: 2 }}>
        <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
            <Table
              sx={{
                minWidth: 650,
                "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.25),
                },
                "& .MuiTableBody-root .MuiTableRow-root:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
                "& .MuiTableCell-root": {
                  borderBottom: "none",
                  py: 0.5,
                  px: 1,
                  fontSize: "0.875rem",
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                <TableRow sx={{ height: 50 }}>
                  <TableCell padding="checkbox" sx={headCellSx}>
                    <Checkbox
                      size="small"
                      checked={allOnPage}
                      indeterminate={someOnPage}
                      onChange={togglePage}
                      disabled={rows.length === 0}
                      inputProps={{ "aria-label": "select all rows on page" }}
                      sx={{
                        color: theme.palette.primary.contrastText,
                        "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                          color: theme.palette.primary.contrastText,
                        },
                      }}
                    />
                  </TableCell>
                  {COLUMNS.map((c) => (
                    <TableCell key={c.label} sx={headCellSx}>
                      {c.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {params.search
                          ? "No rows match your search."
                          : "No rows found."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id} selected={selected.has(row.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={selected.has(row.id)}
                          onChange={() => toggleRow(row.id)}
                          inputProps={{
                            "aria-label": `select row ${row.rowNumber}`,
                          }}
                        />
                      </TableCell>
                      {COLUMNS.map((c) => (
                        <TableCell key={c.label}>
                          {c.value(row) ?? "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={pagination.total}
            rowsPerPage={params.limit}
            page={params.page - 1}
            onPageChange={(_, nextPage) => updateParams({ page: nextPage + 1 })}
            onRowsPerPageChange={(e) =>
              updateParams({ limit: parseInt(e.target.value, 10), page: 1 })
            }
          />
        </Box>
      </Box>

      <IbdPrintDialog
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        uploadId={uploadId}
        rowIds={Array.from(selected)}
        totalRows={upload?.rowCount ?? pagination.total}
      />
    </Box>
  );
}
