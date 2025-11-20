"use client";

import React, { useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Typography,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Save,
  X,
  PlusCircle,
  RefreshCcw,
} from "lucide-react";

export type LookupRow = {
  id: number;
  [key: string]: string | number | boolean | null | undefined;
};

type Props = {
  type: string;
  data: LookupRow[];
  editingId: number | null;
  editObj: Partial<LookupRow>;
  onEdit: (id: number, row: LookupRow) => void;
  onEditChange: (
    key: string,
    value: string | number | boolean | null | undefined
  ) => void;
  onSave: (type: string, id: number) => void;
  onRequestDelete: (type: string, id: number) => void;
  onCancel: () => void;
  onAdd: (type: string) => void;
  addObj: Partial<LookupRow>;
  onAddChange: (
    key: string,
    value: string | number | boolean | null | undefined
  ) => void;
  adding: boolean;
  refresh: () => void;
};

const ADD_ROW_ID = -1;

const LookupCrudTable: React.FC<Props> = ({
  type,
  data,
  editingId,
  editObj,
  onEdit,
  onEditChange,
  onSave,
  onRequestDelete,
  onCancel,
  addObj,
  onAdd,
  onAddChange,
  adding,
  refresh,
}) => {
  const theme = useTheme();
  const safeRows = data;

  const keys = safeRows[0]
    ? Object.keys(safeRows[0]).filter(
        (col) => col !== "createdAt" && col !== "updatedAt" && col !== "type"
      )
    : [];

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = React.useState<number | null>(null);
  const firstAddInputRef = React.useRef<HTMLInputElement | null>(null);

  // --- Pagination State ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate visible rows for pagination
  const visibleRows = React.useMemo(
    () => safeRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [safeRows, page, rowsPerPage]
  );

  React.useEffect(() => {
    if (adding && firstAddInputRef.current) {
      setTimeout(() => firstAddInputRef.current?.focus(), 0);
    }
  }, [adding]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    rowId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(rowId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  // Button Style Configuration
  const buttonSx = {
    bgcolor: (theme: any) => theme.palette.action.hover,
    color: (theme: any) => theme.palette.text.primary,
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
      bgcolor: (theme: any) => theme.palette.primary.main,
      color: (theme: any) => theme.palette.primary.contrastText,
      boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
      "& .MuiSvgIcon-root, & svg": {
        color: "#000",
      },
    },
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        {adding && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {keys
              .filter((key) => key !== "id")
              .map((key, index) => (
                <input
                  key={key}
                  ref={index === 0 ? firstAddInputRef : undefined}
                  autoFocus={index === 0}
                  value={
                    typeof addObj[key] === "boolean"
                      ? String(addObj[key])
                      : (addObj[key] as string ?? "")
                  }
                  onChange={(e) => onAddChange(key, e.target.value)}
                  placeholder={key}
                  className="MuiInputBase-input MuiInput-input"
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 4,
                    padding: 6,
                    width: 260,
                    maxWidth: "100%",
                    background: "inherit",
                  }}
                />
              ))}
            <IconButton
              color="primary"
              onClick={() => onSave(type, ADD_ROW_ID)}
              disabled={keys
                .filter((k) => k !== "id")
                .some(
                  (k) =>
                    typeof addObj[k] !== "string" ||
                    !addObj[k]?.toString().trim()
                )}
            >
              <Save size={18} />
            </IconButton>
            <IconButton color="inherit" onClick={onCancel}>
              <X size={18} />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={() => onAdd(type)}
            disabled={adding}
            startIcon={<PlusCircle size={18} />}
            sx={buttonSx}
          >
            ADD
          </Button>

          <Button
            onClick={refresh}
            startIcon={<RefreshCcw size={18} />}
            sx={buttonSx}
          >
            REFRESH
          </Button>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 0,
        }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
            <TableRow>
              {keys.map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    color: theme.palette.primary.contrastText,
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col === "id" ? "ID" : col.replace(/([A-Z])/g, " $1")}
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: "bold",
                  width: 100,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={keys.length + 1}
                  align="center"
                  sx={{ py: 3 }}
                >
                  <Typography color="text.secondary">No items found.</Typography>
                </TableCell>
              </TableRow>
            )}
            {visibleRows.map((row, index) => {
              const isEditing = editingId === row.id;
              return (
                <TableRow
                  key={row.id}
                  sx={{
                    backgroundColor:
                      index % 2 === 0
                        ? "inherit"
                        : alpha(theme.palette.primary.main, 0.1), // Light Yellow for alternate rows
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.action.hover, 0.05),
                    },
                  }}
                >
                  {keys.map((col) => {
                    const field = col === "type" ? "_type" : col;
                    const key = field === "_type" ? "type" : field;

                    return (
                      <TableCell key={col}>
                        {isEditing && field !== "id" ? (
                          <input
                            value={
                              typeof editObj[key] === "boolean"
                                ? String(editObj[key])
                                : (editObj[key] as string ?? "")
                            }
                            onChange={(e) =>
                              onEditChange(key, e.target.value)
                            }
                            className="MuiInputBase-input MuiInput-input"
                            style={{
                              border: "1px solid #e0e0e0",
                              borderRadius: 4,
                              padding: "4px 8px",
                              width: "100%",
                              background: theme.palette.background.paper,
                              color: theme.palette.text.primary,
                            }}
                          />
                        ) : field === "id" ? (
                          row[field]
                        ) : (
                          String(row[field] ?? "")
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center">
                    {isEditing ? (
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title="Save">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onSave(type, row.id)}
                          >
                            <Save size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            color="inherit"
                            onClick={onCancel}
                          >
                            <X size={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, row.id)}
                        aria-label="row actions"
                      >
                        <MoreVertical size={20} />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Component */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={safeRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuRowId) {
              const row = safeRows.find((r) => r.id === menuRowId);
              if (row) onEdit(Number(menuRowId), row);
            }
            handleMenuClose();
          }}
        >
          <Pencil size={16} style={{ marginRight: 10 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRowId) onRequestDelete(type, Number(menuRowId));
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <Trash2 size={16} style={{ marginRight: 10 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LookupCrudTable;