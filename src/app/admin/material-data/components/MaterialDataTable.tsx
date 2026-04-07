"use client";

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  TablePagination,
  useTheme,
  alpha,
  Box,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Theme,
  Snackbar,
  Alert,
} from "@mui/material";
import type { MaterialRow } from "@/app/admin/material-data/types/material-row";

interface Props {
  rows: MaterialRow[];
  loading?: boolean;
  onUpdateIssueStage?: (
    materialCode: string,
    value: number,
    materialId: number
  ) => Promise<MaterialRow | null>;
  onUpdatePackingStage?: (
    materialCode: string,
    value: number,
    materialId: number
  ) => Promise<MaterialRow | null>;
  onUpdateMapping?: (
    materialId: number, 
    mappingBarcode: string, 
    group: string
  ) => Promise<void>;
  onProcessRowUpdateError?: (error: Error) => void;
  isOrderFullyComplete?: boolean;
  onUpdateRemarks?: (id: number, remarks: string) => Promise<void>;
}

// Helper Component for Editable Cells
const EditableCell = ({
  value,
  max,
  onUpdate,
  disabled
}: {
  value: number;
  max: number;
  onUpdate: (val: number) => Promise<void>;
  disabled?: boolean;
}) => {
  const [localValue, setLocalValue] = useState(String(value));
  const [saving, setSaving] = useState(false);

  // Sync local state if prop changes
  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const handleBlur = async () => {
    if (disabled) return;
    const numericVal = Number(localValue);

    if (isNaN(numericVal) || numericVal === value) {
      setLocalValue(String(value));
      return;
    }

    setSaving(true);
    try {
      await onUpdate(numericVal);
    } catch {
      setLocalValue(String(value));
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  if (disabled) {
    return (
      <Box
        sx={{
          width: '100%',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '35px',
        }}
      >
        <Typography variant="body2" fontWeight={500}>
          {value}
        </Typography>
      </Box>
    );
  }

  return (
    <TextField
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      disabled={saving}
      type="number"
      size="small"
      variant="standard"
      InputProps={{
        disableUnderline: true,
        endAdornment: saving ? <CircularProgress size={14} /> : null,
        inputProps: { min: 0, max, style: { textAlign: 'center', fontWeight: 500 } }
      }}
      sx={{
        width: '100%',
        '& .MuiInputBase-root': {
          backgroundColor: 'transparent',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          '&.Mui-focused': {
             backgroundColor: (theme) => theme.palette.background.paper,
             boxShadow: (theme) => theme.shadows[1]
          }
        }
      }}
    />
  );
};

export default function MaterialDataTable({
  rows,
  loading,
  onUpdateIssueStage,
  onUpdatePackingStage,
  onUpdateMapping,
  onProcessRowUpdateError,
  isOrderFullyComplete = false,
  onUpdateRemarks,
}: Props) {
  const theme = useTheme();

  // --- Pagination State ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);
  const [currentRemarkRow, setCurrentRemarkRow] = useState<MaterialRow | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [savingRemark, setSavingRemark] = useState(false);

  const [isMandatoryMode, setIsMandatoryMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [currentMappingRow, setCurrentMappingRow] = useState<MaterialRow | null>(null);
  const [mappingBarcodeVal, setMappingBarcodeVal] = useState("");
  const [groupVal, setGroupVal] = useState("");
  const [savingMapping, setSavingMapping] = useState(false);

  const buttonSx = {
    bgcolor: (theme: Theme) => theme.palette.action.hover,
    color: (theme: Theme) => theme.palette.text.primary,
    borderRadius: 0,
    clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
    fontWeight: 600,
    fontSize: 15,
    minWidth: 100,
    height: 40,
    px: 3,
    textTransform: "none" as const,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      bgcolor: (theme: Theme) => theme.palette.primary.main,
      color: (theme: Theme) => theme.palette.primary.contrastText,
      boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
    },
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  };

  const handleOpenRemarks = (row: MaterialRow, mandatory = false) => {
    setCurrentRemarkRow(row);
    setRemarkText(row.remarks || "");
    setIsMandatoryMode(mandatory);
    setRemarksDialogOpen(true);
  };

  const handleCloseRemarks = () => {
    if (isMandatoryMode && !remarkText.trim()) {
       return; 
    }
    setRemarksDialogOpen(false);
    setCurrentRemarkRow(null);
    setRemarkText("");
    setIsMandatoryMode(false);
  };

  const handleSaveRemarks = async () => {
    if (!currentRemarkRow || !onUpdateRemarks) return;
    setSavingRemark(true);
    try {
      await onUpdateRemarks(currentRemarkRow.id, remarkText);
      setRemarksDialogOpen(false);
      setCurrentRemarkRow(null);
      setRemarkText("");
      setIsMandatoryMode(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingRemark(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate visible rows
  const visibleRows = React.useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, page, rowsPerPage]
  );

  // Packing becomes editable only when every row is fully issued
  const allIssued =
    rows.length > 0 && rows.every((r) => r.issueStage >= r.reqQuantity);

  // Logic to update Issue Stage
  const handleIssueUpdate = async (row: MaterialRow, newValue: number) => {
    if (!onUpdateIssueStage) return;
    const cap = row.reqQuantity;

    try {
      if (newValue < 0 || newValue > cap) {
        throw new Error(`Issue Stage must be between 0 and ${cap}`);
      }
      const updated = await onUpdateIssueStage(row.materialCode, newValue, row.id);
      if (!updated) throw new Error("Update failed: Server returned no data.");
    } catch (error) {
      if (error instanceof Error && onProcessRowUpdateError) {
        onProcessRowUpdateError(error);
      }
      throw error;
    }
  };

  const handlePackingUpdate = async (row: MaterialRow, newValue: number) => {
    if (!onUpdatePackingStage) return;
    const cap = Math.min(row.reqQuantity, row.issueStage);

    try {
      if (!allIssued) {
        throw new Error("Packing is locked until all items are fully issued.");
      }
      if (newValue < 0 || newValue > cap) {
        throw new Error(`Packing Stage must be between 0 and ${cap}`);
      }
      const updated = await onUpdatePackingStage(row.materialCode, newValue, row.id);
      if (!updated) throw new Error("Update failed: Server returned no data.");

      if (newValue === row.reqQuantity && row.remarksRequired && !updated.remarks) {
          setSnackbarMessage(`Remarks Mandatory for ${row.materialCode}`);
          setSnackbarOpen(true);
          handleOpenRemarks(updated, true); 
      }

    } catch (error) {
      if (error instanceof Error && onProcessRowUpdateError) {
        onProcessRowUpdateError(error);
      }
      throw error;
    }
  };

  const handleOpenMapping = (row: MaterialRow) => {
    setCurrentMappingRow(row);
    setGroupVal(row.group || ""); 
    setMappingBarcodeVal("");
    setMappingDialogOpen(true);
  };

  const handleCloseMapping = () => {
    setMappingDialogOpen(false);
    setCurrentMappingRow(null);
    setMappingBarcodeVal("");
    setGroupVal("");
  };

  const handleSaveMapping = async () => {
    if (!currentMappingRow || !onUpdateMapping) return;
    setSavingMapping(true);
    try {
      await onUpdateMapping(currentMappingRow.id, mappingBarcodeVal, groupVal);
      handleCloseMapping();
    } catch (error) {
        if (onProcessRowUpdateError && error instanceof Error) {
            onProcessRowUpdateError(error);
        }
    } finally {
      setSavingMapping(false);
    }
  };

  // Helper to determine cell background colors
  const getCellStyle = (r: MaterialRow, field: 'issueStage' | 'packingStage' | 'other') => {
    const reqEqIssue = r.reqQuantity === r.issueStage;
    const packingCap = Math.min(r.reqQuantity, r.issueStage);
    const packedDone = r.packingStage >= packingCap && r.issueStage >= r.reqQuantity;

    const GREEN_BG = alpha("#2ea043", 0.18);
    const YELLOW_BG = alpha("#ffc107", 0.18);
    const DISABLED_BG = alpha("#ccc", 0.3);

    if (packedDone) return { backgroundColor: GREEN_BG };
    if (field === 'packingStage' && !allIssued) {
       return { backgroundColor: DISABLED_BG, color: '#888' };
    }
    if (!allIssued && reqEqIssue) {
      return field === 'packingStage' ? {} : { backgroundColor: GREEN_BG };
    }
    if (allIssued && reqEqIssue) {
      return field === 'packingStage' ? {} : { backgroundColor: YELLOW_BG };
    }
    return {};
  };

  const getRowStyle = (r: MaterialRow) => {
     const packedCap = Math.min(r.reqQuantity, r.issueStage);
     const fulfilled = r.packingStage >= packedCap && r.issueStage >= r.reqQuantity;
     if (fulfilled) {
        return { backgroundColor: alpha(theme.palette.success.light, 0.2) };
     }
     return {};
  };

  if (loading && rows.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    // Replaced Paper with Box to remove shadow and border radius for unification
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small" aria-label="Material Data Table">
          <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
            <TableRow>
              {[
                { id: 'siNo', label: 'S.No', width: 50 },
                { id: 'materialCode', label: 'Material Code', width: 150 },
                { id: 'materialDescription', label: 'Description', width: 250 },
                { id: 'batchNo', label: 'Batch No', width: 130 },
                { id: 'soDonorBatch', label: 'SO DONOR Batch', width: 150 },
                { id: 'certNo', label: 'Cert No', width: 130 },
                { id: 'binNo', label: 'Bin No', width: 120 },
                { id: 'adf', label: 'A/D/F', width: 120 },
                { id: 'reqQuantity', label: 'Req Qty', width: 100, align: 'center' },
                { id: 'issueStage', label: 'Issue Stage', width: 120, align: 'center' },
                { id: 'packingStage', label: 'Packing Stage', width: 120, align: 'center' },
              ].map((col) => (
                <TableCell
                  key={col.id}
                  align={(col.align as 'left' | 'center' | 'right') || 'left'}
                  sx={{
                    width: col.width,
                    fontWeight: 'bold',
                    color: theme.palette.primary.contrastText,
                    whiteSpace: 'nowrap',
                    py: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  ...getRowStyle(row),
                  '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.05) },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell sx={getCellStyle(row, 'other')}>
                    {!row.mappingBarcode ? (
                        <MuiLink
                            component="button"
                            variant="body2"
                            onClick={() => handleOpenMapping(row)}
                            sx={{
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                color: 'primary.main',      
                                cursor: 'pointer',
                                '&:hover': {
                                    textDecoration: 'underline',
                                    color: 'primary.dark',  
                                }
                            }}
                        >
                            {row.siNo}
                        </MuiLink>
                    ) : (
                        row.siNo
                    )}
                </TableCell>
                <TableCell sx={getCellStyle(row, 'other')}>
                  <Box display="flex" flexDirection="column">
                    {row.remarksRequired ? (
                      <MuiLink
                        component="button"
                        variant="body2"
                        onClick={() => handleOpenRemarks(row)}
                        sx={{ 
                          textAlign: 'left', 
                          fontWeight: 'bold',
                          textDecoration: 'none',
                          color: 'primary.main',
                          "&:hover": {
                            textDecoration: 'underline',
                            color: 'primary.dark',  
                          }
                        }}
                      >
                        {row.materialCode}
                      </MuiLink>
                    ) : (
                      <Typography variant="body2">{row.materialCode}</Typography>
                    )}

                    {row.mappingBarcode && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                        {row.mappingBarcode}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={getCellStyle(row, 'other')}>{row.materialDescription}</TableCell>
                <TableCell sx={getCellStyle(row, 'other')}>{row.batchNo}</TableCell>
                <TableCell sx={getCellStyle(row, 'other')}>{row.soDonorBatch}</TableCell>
                <TableCell sx={getCellStyle(row, 'other')}>{row.certNo}</TableCell>
                <TableCell sx={getCellStyle(row, 'other')}>{row.binNo}</TableCell>
                <TableCell sx={getCellStyle(row, 'other')}>{row.adf}</TableCell>
                <TableCell align="center" sx={getCellStyle(row, 'other')}>
                  {row.reqQuantity}
                </TableCell>

                {/* ISSUE STAGE CELL */}
                <TableCell align="center" sx={{ ...getCellStyle(row, 'issueStage'), p: 1 }}>
                  <EditableCell
                    value={row.issueStage}
                    max={row.reqQuantity}
                    onUpdate={(val) => handleIssueUpdate(row, val)}
                    disabled={isOrderFullyComplete || !onUpdateIssueStage}
                  />
                </TableCell>

                {/* PACKING STAGE CELL */}
                <TableCell align="center" sx={{ ...getCellStyle(row, 'packingStage'), p: 1 }}>
                  <EditableCell
                    value={row.packingStage}
                    max={Math.min(row.reqQuantity, row.issueStage)}
                    onUpdate={(val) => handlePackingUpdate(row, val)}
                    disabled={
                      isOrderFullyComplete ||
                      !onUpdatePackingStage ||
                      !allIssued
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
               <TableRow>
                 <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                   <Typography variant="body2" color="text.secondary">
                     No material data available.
                   </Typography>
                 </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={remarksDialogOpen} onClose={handleCloseRemarks} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          color: theme.palette.secondary.main, 
          fontWeight: 'bold', 
          textTransform: 'uppercase'
        }}>
          {currentRemarkRow?.remarks ? "EDIT REMARKS" : "ADD REMARKS"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            id="remarks"
            label="Remarks"
            type="text"
            fullWidth
            multiline
            minRows={4}
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            variant="outlined"
            error={isMandatoryMode && !remarkText.trim()}
            helperText={isMandatoryMode && !remarkText.trim() ? "Remarks are mandatory." : ""}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
            {!isMandatoryMode && (
                <Button 
                    onClick={handleCloseRemarks} 
                    sx={buttonSx}
                    disabled={savingRemark}
                >
                    CANCEL
                </Button>
            )}
            
            <Button 
                onClick={handleSaveRemarks} 
                sx={buttonSx}
                disabled={savingRemark || (isMandatoryMode && !remarkText.trim())}
            >
                {savingRemark ? "SAVING..." : "SAVE"}
            </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={mappingDialogOpen} onClose={handleCloseMapping} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
            Add Mapping Details
        </DialogTitle>
        <DialogContent dividers>
            <Typography variant="caption" gutterBottom display="block">
                Material: {currentMappingRow?.materialCode}
            </Typography>
            <TextField
                autoFocus
                margin="dense"
                label="Mapping Barcode"
                type="text"
                fullWidth
                variant="outlined"
                value={mappingBarcodeVal}
                onChange={(e) => setMappingBarcodeVal(e.target.value)}
                placeholder="Enter Mapping Barcode"
            />
            <TextField
                margin="dense"
                label="Group"
                type="text"
                fullWidth
                variant="outlined"
                value={groupVal}
                onChange={(e) => setGroupVal(e.target.value)}
                placeholder="Enter Group (Optional)"
            />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseMapping} disabled={savingMapping} sx={buttonSx}>
                CANCEL
            </Button>
            <Button onClick={handleSaveMapping} disabled={savingMapping} sx={buttonSx}>
                {savingMapping ? "SAVING..." : "SUBMIT"}
            </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" sx={{ width: '100%', fontWeight: 'bold' }} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}