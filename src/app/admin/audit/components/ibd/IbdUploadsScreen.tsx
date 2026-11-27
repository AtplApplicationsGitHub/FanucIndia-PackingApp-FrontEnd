"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
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
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { formatDateIST } from "@/common/utils/dateTime";
import ExcelUploadButton from "../shared/ExcelUploadButton";
import { useIbdUploads } from "../../hooks/ibd/useIbdUploads";
import { showGlobalMessage } from "../../utils/auditEvents";

const UPLOAD_HINT =
  "Upload a .xlsx file. Row 1 must contain the IBD Print column headers.";

export default function IbdUploadsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    uploads,
    pagination,
    params,
    loading,
    uploading,
    updateParams,
    upload,
  } = useIbdUploads();

  const [searchInput, setSearchInput] = useState(params.search);

  const headCellSx = {
    fontWeight: 700,
    color: theme.palette.primary.contrastText,
    whiteSpace: "nowrap" as const,
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* TOOLBAR: search + upload */}
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
            {/* SEARCH */}
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
                placeholder="Search ID, file name or uploaded by"
                inputProps={{ "aria-label": "search uploads" }}
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

            {/* UPLOAD: the file is sent as soon as it is picked */}
            <Box sx={{ minWidth: 0, display: "flex", alignItems: "center" }}>
              <ExcelUploadButton
                file={null}
                onChange={(file) => {
                  if (file) void upload(file);
                }}
                onError={(message) => showGlobalMessage(message, "error")}
                disabled={uploading}
                uploadTooltip={UPLOAD_HINT}
              />
            </Box>

            {uploading && <CircularProgress size={20} />}
          </Paper>
        </Box>
      </Box>

      {/* TABLE */}
      <Box sx={{ px: 2 }}>
        <Box
          sx={{
            width: "100%",
            bgcolor: "background.paper",
          }}
        >
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ borderRadius: 0 }}
          >
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
                  <TableCell sx={headCellSx}>ID</TableCell>
                  <TableCell sx={headCellSx}>FILE NAME</TableCell>
                  <TableCell sx={headCellSx}>UPLOADED BY</TableCell>
                  <TableCell sx={headCellSx}>UPLOADED AT</TableCell>
                  <TableCell sx={headCellSx} align="right">
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : uploads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {params.search
                          ? "No uploads match your search."
                          : "No uploads yet."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  uploads.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.fileName}</TableCell>
                      <TableCell>{row.uploadedByName}</TableCell>
                      <TableCell>{formatDateIST(row.uploadedAt)}</TableCell>
                      <TableCell align="right" sx={{ width: "1%" }}>
                        <Tooltip title="View" arrow>
                          <IconButton
                            size="small"
                            aria-label={`View ${row.fileName}`}
                            onClick={() => router.push(`/admin/audit/ibd/${row.id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
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
    </Box>
  );
}
