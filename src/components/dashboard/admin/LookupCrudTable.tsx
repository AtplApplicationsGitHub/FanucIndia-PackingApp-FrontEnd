"use client";
import React from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowId,
  GridEventListener,
} from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Typography,
  Tooltip,
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
  // 1. Preprocess rows: remap "type" column to "_type" for DataGrid only
  // const safeRows: LookupRow[] = (
  //   adding ? [...data, { id: ADD_ROW_ID, ...addObj }] : data
  // ).map((row) => (row.type !== undefined ? { ...row, _type: row.type } : row));

  const safeRows = data;

  // 2. Get all keys, skipping timestamps and the original "type"
  const keys = safeRows[0]
    ? Object.keys(safeRows[0]).filter(
        (col) => col !== "createdAt" && col !== "updatedAt" && col !== "type"
      )
    : [];

  const activeEditId = adding ? ADD_ROW_ID : editingId;

  // 3. Actions menu state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = React.useState<GridRowId | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    rowId: GridRowId
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(rowId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  // 4. Column definitions, with _type field mapped to display and edit "type" in your data
  const columns: GridColDef<LookupRow>[] = [
    ...keys.map((col) => {
      // Patch: Prevent field: "type"
      const field = col === "type" ? "_type" : col;
      return {
        field,
        headerName: col === "id" ? "ID" : col.replace(/([A-Z])/g, " $1"),
        minWidth: 110,
        flex: col === "id" ? 0.3 : 1,
        align: col === "id" ? "center" : "left",
        headerAlign: col === "id" ? "center" : "left",
        editable: false,
        renderCell: (params: GridRenderCellParams<LookupRow>) => {
          const row = params.row;
          // For "_type", always map back to "type" for input/edit logic
          const key = field === "_type" ? "type" : field;
          if (activeEditId === row.id && field !== "id") {
            const value = row.id === ADD_ROW_ID ? addObj[key] : editObj[key];
            const handleChange =
              row.id === ADD_ROW_ID ? onAddChange : onEditChange;
            return (
              <input
                value={
                  typeof value === "boolean" ? String(value) : (value ?? "")
                }
                onChange={(e) => handleChange(key, e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                }}
                className="MuiInputBase-input MuiInput-input"
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 4,
                  padding: 6,
                  width: "100%",
                  background: "inherit",
                }}
                placeholder={key}
              />
            );
          }
          if (field === "id") {
            return row.id === ADD_ROW_ID ? (
              <Typography color="text.secondary" fontStyle="italic">
                Auto
              </Typography>
            ) : (
              row[field]
            );
          }
          return String(row[field] ?? "");
        },
      } as GridColDef<LookupRow>;
    }),
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<LookupRow>) => {
        const row = params.row;
        if (activeEditId === row.id) {
          const isIncomplete =
            row.id === ADD_ROW_ID &&
            keys
              .filter((k) => k !== "id")
              .some(
                (k) =>
                  typeof addObj[k === "type" ? "type" : k] !== "string" ||
                  !addObj[k === "type" ? "type" : k]?.toString().trim()
              );
          return (
            <Box display="flex" gap={1} justifyContent="center">
              <Tooltip title="Save">
                <span>
                  <IconButton
                    color="primary"
                    onClick={() => onSave(type, row.id)}
                    disabled={isIncomplete}
                  >
                    <Save size={18} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton color="inherit" onClick={onCancel}>
                  <X size={18} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }
        return (
          <Box>
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, row.id)}
              aria-label="row actions"
            >
              <MoreVertical size={20} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && menuRowId === row.id}
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
                  onEdit(row.id, row);
                  handleMenuClose();
                }}
              >
                <Pencil size={16} style={{ marginRight: 10 }} /> Edit
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onRequestDelete(type, row.id);
                  handleMenuClose();
                }}
                sx={{ color: "error.main" }}
              >
                <Trash2 size={16} style={{ marginRight: 10 }} /> Delete
              </MenuItem>
            </Menu>
          </Box>
        );
      },
    },
  ];

  // 5. Keyboard handler to prevent Ctrl+A/Cmd+A select-all from toggling row selection while editing
  const handleCellKeyDown: GridEventListener<"cellKeyDown"> = (
    params,
    event
  ) => {
    const isCtrlA =
      (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a";
    if (isCtrlA && params.isEditable) {
      event.stopPropagation(); // Prevent DataGrid from toggling all row selection in edit mode
    }
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
        {/* Add Row Inputs (if adding is true) */}
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
              .map((key) => (
                <input
                  key={key}
                  value={
                    typeof addObj[key] === "boolean"
                      ? String(addObj[key])
                      : (addObj[key] ?? "")
                  }
                  onChange={(e) => onAddChange(key, e.target.value)}
                  placeholder={key}
                  className="MuiInputBase-input MuiInput-input"
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 4,
                    padding: 6,
                    width: 120,
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

        {/* Ghost Buttons on the right */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            size="small"
            startIcon={<PlusCircle size={18} />}
            onClick={() => onAdd(type)}
            disabled={adding}
            sx={{
              color: (theme) => theme.palette.text.primary,
              "&:hover": {
                backgroundColor: (theme) => theme.palette.action.hover,
              },
              borderRadius: 0,
            }}
          >
            Add
          </Button>

          <Button
            size="small"
            startIcon={<RefreshCcw size={18} />}
            onClick={refresh}
            sx={{
              color: (theme) => theme.palette.text.primary,
              "&:hover": {
                backgroundColor: (theme) => theme.palette.action.hover,
              },
              borderRadius: 0,
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      <DataGrid
        autoHeight
        rows={safeRows}
        columns={columns}
        getRowId={(row) => row.id}
        pagination
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        sx={{
          border: "none",
          bgcolor: "background.paper",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(0,0,0,0.04)",
            fontWeight: 600,
          },
          "& .MuiDataGrid-cell": {
            py: 1,
            lineHeight: 1.3,
          },
        }}
        localeText={{
          noRowsLabel: (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
              No items found.
            </Typography>
          ) as unknown as string,
        }}
        onCellKeyDown={handleCellKeyDown}
      />
    </Box>
  );
};

export default LookupCrudTable;
