"use client";

import React, { useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
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
  alpha,
  useTheme,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Trash2 } from "lucide-react";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";
import type { useLocations } from "../hooks/useLocations";
import type { RackLevel } from "../types/admin";

type Props = {
  state: ReturnType<typeof useLocations>;
};

const INVALID_PAGE_SIZE = 10;
const RACK_PAGE_SIZE = 10;

export default function LocationPanel({ state }: Props) {
  const theme = useTheme();
  const [deleteTarget, setDeleteTarget] = useState<RackLevel | null>(null);

  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null,
  );

  const [rackPage, setRackPage] = useState(0);
  const [invalidPage, setInvalidPage] = useState(0);

  const selectedLocation = state.rows.find(
    (row) => row.id === selectedLocationId,
  );

  const rackNumbers = selectedLocation?.rackNumbers ?? [];

  const currentRackPage = Math.min(
    rackPage,
    Math.max(0, Math.ceil(rackNumbers.length / RACK_PAGE_SIZE) - 1),
  );

  const visibleRackNumbers = rackNumbers.slice(
    currentRackPage * RACK_PAGE_SIZE,
    (currentRackPage + 1) * RACK_PAGE_SIZE,
  );
  const headCell = {
    bgcolor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: "bold",
    whiteSpace: "nowrap" as const,
  };

  const { preview } = state;

  const invalidRows = preview
    ? preview.rows.filter((r) => r.status === "INVALID")
    : [];

  const currentInvalidPage = Math.min(
    invalidPage,
    Math.max(0, Math.ceil(invalidRows.length / INVALID_PAGE_SIZE) - 1),
  );

  const previewRows = invalidRows.slice(
    currentInvalidPage * INVALID_PAGE_SIZE,
    (currentInvalidPage + 1) * INVALID_PAGE_SIZE,
  );

  const closeInvalidPreview = () => {
    setInvalidPage(0);
    state.closePreview();
  };

  return (
    <>
      {state.error ? (
        <Alert severity="error">{state.error}</Alert>
      ) : (
        <Paper
          sx={{
            width: "100%",
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <TableContainer>
            <Table stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...headCell, width: "37%" }}>ID</TableCell>

                  <TableCell sx={{ ...headCell, width: "38%" }}>
                    Plant Code
                  </TableCell>

                  <TableCell sx={{ ...headCell, width: "25%" }}>
                    Master Barcode
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {state.loading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : state.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No items found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  state.rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        backgroundColor:
                          index % 2 === 1
                            ? alpha(theme.palette.primary.main, 0.2)
                            : "inherit",
                      }}
                    >
                      <TableCell>{row.id}</TableCell>

                      <TableCell>{row.plantCode}</TableCell>

                      <TableCell>
                        <Link
                          component="button"
                          type="button"
                          onClick={() => {
                            setRackPage(0);
                            setSelectedLocationId(row.id);
                          }}
                          sx={{
                            color: "#0EA5E9",
                            fontWeight: 600,
                            fontSize: "inherit",
                            cursor: "pointer",
                            textDecoration: "none",
                            "&:hover": {
                              color: "#0B8ACB",
                            },
                          }}
                        >
                          {row.masterBarcode}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={state.total}
            rowsPerPage={state.rowsPerPage}
            page={state.page}
            onPageChange={(_, p) => state.setPage(p)}
            onRowsPerPageChange={(e) =>
              state.changeRowsPerPage(parseInt(e.target.value, 10))
            }
          />
        </Paper>
      )}

      {/* Rack Numbers Popup */}
      <Dialog
        open={!!selectedLocation && !deleteTarget}
        transitionDuration={0}
        onClose={() => {
          if (!state.deleting) setSelectedLocationId(null);
        }}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: { maxWidth: 340 },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "20px",
            letterSpacing: 0.5,
            color: "error.main",
            pb: 1,
            position: "relative",
          }}
        >
          {selectedLocation?.masterBarcode ?? ""}

          <Chip
            label={rackNumbers.length}
            size="small"
            sx={{
              ml: 1,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              minWidth: 24,
              height: 24,
              borderRadius: "50px",
              fontSize: "12px",
              fontWeight: 700,
              "& .MuiChip-label": {
                px: 0.75,
              },
            }}
          />
          <IconButton
            aria-label="close"
            onClick={() => setSelectedLocationId(null)}
            disabled={state.deleting}
            size="small"
            sx={{
              position: "absolute",
              right: 12,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          <Box
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table
                size="small"
                stickyHeader
                sx={{
                  "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.25),
                  },
                  "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root":
                    {
                      borderBottom: 0,
                    },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...headCell, width: "60%" }}>
                      Rack Number
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ ...headCell, width: "40%" }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {visibleRackNumbers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          No rack numbers found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleRackNumbers.map((rackNumber) => (
                      <TableRow key={rackNumber} hover>
                        <TableCell>{rackNumber}</TableCell>

                        <TableCell align="center">
                          <Tooltip title="Delete">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={state.deleting}
                                onClick={() => {
                                  if (!selectedLocation) return;

                                  setDeleteTarget({
                                    plantCode: selectedLocation.plantCode,
                                    rackNumber,
                                  });
                                }}
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {rackNumbers.length > RACK_PAGE_SIZE && (
              <TablePagination
                component="div"
                count={rackNumbers.length}
                page={currentRackPage}
                rowsPerPage={RACK_PAGE_SIZE}
                rowsPerPageOptions={[]}
                onPageChange={(_, page) => setRackPage(page)}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        disableTransition
        onConfirm={async () => {
          if (!deleteTarget) return;

          const isLastRack = rackNumbers.length === 1;

          const success = await state.deleteLevel(deleteTarget);

          if (success) {
            setDeleteTarget(null);

            if (isLastRack) {
              setSelectedLocationId(null);
              setRackPage(0);
            } else {
              setRackPage(
                Math.min(
                  currentRackPage,
                  Math.max(
                    0,
                    Math.ceil((rackNumbers.length - 1) / RACK_PAGE_SIZE) - 1,
                  ),
                ),
              );
            }
          }
        }}
        onCancel={() => {
          if (!state.deleting) setDeleteTarget(null);
        }}
        loading={state.deleting}
        title="DELETE CONFIRMATION"
        description={
          deleteTarget
            ? `Delete rack ${deleteTarget.rackNumber} from master barcode ${selectedLocation?.masterBarcode ?? ""}?`
            : ""
        }
      />

      {/* Upload Errors Popup */}
      <Dialog
        open={!!preview}
        onClose={state.uploading ? undefined : closeInvalidPreview}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "20px",
            letterSpacing: 0.5,
            color: "error.main",
            pb: 1,
            position: "relative",
          }}
        >
          INVALID ROWS
          <IconButton
            aria-label="close"
            onClick={closeInvalidPreview}
            disabled={state.uploading}
            size="small"
            sx={{ position: "absolute", right: 12 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          {preview && (
            <Box display="flex" flexDirection="column" gap={2}>
              <TableContainer>
                <Table
                  stickyHeader
                  size="small"
                  sx={{
                    "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)":
                      {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headCell}>Plant Code</TableCell>
                      <TableCell sx={headCell}>Rack Number</TableCell>
                      <TableCell sx={headCell}>Master Barcode</TableCell>
                      <TableCell sx={headCell}>Errors</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {previewRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No invalid rows found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      previewRows.map((r) => (
                        <TableRow key={r.rowNumber} hover>
                          <TableCell>{r.plantCode}</TableCell>
                          <TableCell>{r.rackNumber}</TableCell>
                          <TableCell>{r.masterBarcode}</TableCell>

                          <TableCell
                            sx={{
                              minWidth: 220,
                            }}
                          >
                            {r.errors.join(" ")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {invalidRows.length > INVALID_PAGE_SIZE && (
                <TablePagination
                  component="div"
                  count={invalidRows.length}
                  page={currentInvalidPage}
                  rowsPerPage={INVALID_PAGE_SIZE}
                  rowsPerPageOptions={[]}
                  onPageChange={(_, page) => setInvalidPage(page)}
                />
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
