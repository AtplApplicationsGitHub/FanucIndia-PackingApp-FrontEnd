"use client";

import { FC, useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControlLabel,
  Switch,
  Theme,
  useTheme,
  IconButton,
  CircularProgress,
  Tooltip,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import UploadErpMaterialFileButton from "@/app/admin/material-data/components/UploadErpMaterialFileButton";
import UploadAttachmentDialog from "@/app/admin/material-data/components/UploadAttachmentDialog";
import { MaterialRow } from "../types/material-row";
import { getMaterialFilesBySaleOrder } from "@/common/services/materialFile.service";
import CommonButton from "@/common/components/CommonButton";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { formatDateTimeIST } from "@/common/utils/dateTime";

interface Props {
  onSubmit: (value: string) => void;
  saleOrderNumber: string;
  onFileCreated: () => void;
  disabled?: boolean;
  items: MaterialRow[];
  uniqueClassifications?: string[];
  selectedClassification?: string | null;
  onClassificationChange?: (classification: string | null) => void;
  uniqueGroups?: string[];
  selectedGroup?: string | null;
  onGroupChange?: (group: string | null) => void;
  onBulkAccept?: () => void;
  showBulkButton?: boolean;
  showAll: boolean;
  onToggleShowAll: (val: boolean) => void;
  showAcceptAllIssueButton?: boolean;
  onAcceptAllIssue?: () => void;
  onDeleteErpData?: () => Promise<void> | void;
  showPrintButton?: boolean;
  onPrintClick?: () => void;
}

const LastUpdatedInfo: FC<{ items: MaterialRow[] }> = ({ items }) => {
  const lastUpdatedItem = useMemo(() => {
    if (!items || items.length === 0) return null;
    const updatedItems = items.filter((item) => item.updatedDate);
    if (updatedItems.length === 0) return null;
    return updatedItems.sort(
      (a, b) => new Date(b.updatedDate!).getTime() - new Date(a.updatedDate!).getTime()
    )[0];
  }, [items]);

  if (!lastUpdatedItem || !lastUpdatedItem.updatedBy || !lastUpdatedItem.updatedDate) {
    return <Box sx={{ flex: 1, minWidth: 300 }} />;
  }

  const formattedDate = formatDateTimeIST(lastUpdatedItem.updatedDate);

  return (
    <Box sx={{ flex: 1, minWidth: 300, textAlign: "left" }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        Last Updated By: {lastUpdatedItem.updatedBy}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Last Updated At: {formattedDate}
      </Typography>
    </Box>
  );
};

const InputBoxSection: FC<Props> = ({
  onSubmit,
  saleOrderNumber,
  onFileCreated,
  disabled = false,
  items,
  uniqueClassifications = [],
  selectedClassification = null,
  onClassificationChange,
  uniqueGroups = [],
  selectedGroup = null,
  onGroupChange,
  onBulkAccept,
  showBulkButton = false,
  showAll,
  onToggleShowAll,
  showAcceptAllIssueButton = false,
  onAcceptAllIssue,
  onDeleteErpData,
  showPrintButton,
  onPrintClick,
}) => {
  const theme = useTheme();
  const [value, setValue] = useState("");
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fileCount, setFileCount] = useState<number>(0);
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(menuAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchCount = useCallback(async () => {
    if (!saleOrderNumber) return;
    try {
      const files = await getMaterialFilesBySaleOrder(saleOrderNumber);
      setFileCount(files.length);
    } catch (e) {
      console.error("Failed to fetch file count", e);
    }
  }, [saleOrderNumber]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedGroup, showAll]);

  const handleFileChange = () => {
    onFileCreated();
    fetchCount();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
    setValue("");
  };

  const handleDelete = async () => {
    if (!onDeleteErpData) {
      console.error("No delete handler provided");
      return;
    }

    setIsDeleting(true);
    try {
      await onDeleteErpData();
      setConfirmDeleteOpen(false);
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="w-full">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={3}
        sx={{ mx: "auto" }}
      >
        <LastUpdatedInfo items={items} />

        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          gap={2}
          alignItems="center"
          justifyContent="center"
          flex={2}
        >
          {uniqueClassifications.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="classification-filter-label">Classification</InputLabel>
              <Select
                labelId="classification-filter-label"
                value={selectedClassification || ""}
                label="Classification"
                onChange={(e) =>
                  onClassificationChange?.(e.target.value === "" ? null : e.target.value)
                }
                sx={{
                  bgcolor: "background.paper",
                  "& .MuiOutlinedInput-root": { borderRadius: 1 }
                }}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {uniqueClassifications.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {uniqueGroups.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="group-filter-label">Group Filter</InputLabel>
              <Select
                labelId="group-filter-label"
                value={selectedGroup || ""}
                label="Group Filter"
                onChange={(e) =>
                  onGroupChange?.(e.target.value === "" ? null : e.target.value)
                }
                sx={{
                  bgcolor: "background.paper",
                  "& .MuiOutlinedInput-root": { borderRadius: 1 }
                }}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {uniqueGroups.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            inputRef={inputRef}
            size="small"
            label="Scan / Enter Material Code"
            placeholder="e.g., ROB-HAND-001"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputProps={{ autoFocus: true }}
            disabled={disabled}
            sx={{ width: 350, "& .MuiOutlinedInput-root": { borderRadius: 1, bgcolor: 'background.paper' } }}
          />

          <CommonButton type="submit" disabled={disabled}>
            SUBMIT
          </CommonButton>

          {/* {showBulkButton && (
            <CommonButton
              variant="contained"
              onClick={() => setConfirmOpen(true)}
              disabled={disabled}
            >
              ACCEPT GROUP ITEMS
            </CommonButton>
          )}

          {showAcceptAllIssueButton && (
            <CommonButton
              variant="contained"
              onClick={() => setConfirmAllOpen(true)}
              disabled={disabled}
            >
              ACCEPT ALL
            </CommonButton>
          )}

          <UploadErpMaterialFileButton
            saleOrderNumber={saleOrderNumber}
            onCreated={handleFileChange}
            onOpenDialog={() => setOpenUploadDialog(true)}
            buttonProps={{ type: "button", disabled: disabled }}
          />

          <Tooltip title="Delete ERP Data / Reset Order">
            <IconButton
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={disabled}
              sx={{
                color: theme.palette.error.main,
                "&:hover": { bgcolor: "rgba(211, 47, 47, 0.04)" }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          {showPrintButton && (
            <Tooltip title="Print Order Labels">
              <IconButton
                onClick={onPrintClick}
                // color="primary"
                sx={{
                  ml: 1,
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
          )} */}

          <Tooltip title="More Actions">
            <IconButton
              onClick={handleMenuClick}
              disabled={disabled}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                ml: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={menuAnchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: { mt: 1, minWidth: 180, boxShadow: theme.shadows[4] }
            }}
          >
            {showBulkButton && (
              <MenuItem onClick={() => { handleMenuClose(); setConfirmOpen(true); }}>
                <ListItemIcon><DoneAllIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Accept Group Items</ListItemText>
              </MenuItem>
            )}

            {showAcceptAllIssueButton && (
              <MenuItem onClick={() => { handleMenuClose(); setConfirmAllOpen(true); }}>
                <ListItemIcon><DoneAllIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Accept All</ListItemText>
              </MenuItem>
            )}

            <MenuItem onClick={() => { handleMenuClose(); setOpenUploadDialog(true); }}>
              <ListItemIcon><CloudUploadIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Upload File</ListItemText>
            </MenuItem>

            {showPrintButton && (
              <MenuItem onClick={() => { handleMenuClose(); onPrintClick?.(); }}>
                <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Print Labels</ListItemText>
              </MenuItem>
            )}

            <Divider />

            <MenuItem
              onClick={() => { handleMenuClose(); setConfirmDeleteOpen(true); }}
              sx={{ color: theme.palette.error.main }}
            >
              <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText>Delete ERP Data</ListItemText>
            </MenuItem>
          </Menu>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                whiteSpace: "nowrap",
                minWidth: "60px",
              }}
            >
              {fileCount} {fileCount === 1 ? "File" : "Files"}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={showAll}
                  onChange={(e) => onToggleShowAll(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ fontSize: "0.85rem", whiteSpace: 'nowrap' }}
                >
                  Show All
                </Typography>
              }
              sx={{ ml: 1, mr: 0 }}
            />
          </Box>
        </Box>

        <Box flex={1} />
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ color: theme.palette.secondary.main, fontWeight: 700, textTransform: 'uppercase' }}>
          Accept Group Items?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to accept all items in the group{" "}
            <strong>&quot;{selectedGroup}&quot;</strong>?
            <br />
            <br />
            This will automatically fill the quantities for all items in this
            group.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <CommonButton
            onClick={() => setConfirmOpen(false)}
          >
            NO
          </CommonButton>

          <CommonButton
            onClick={() => {
              setConfirmOpen(false);
              onBulkAccept?.();
            }}
            autoFocus
          >
            YES, ACCEPT ALL
          </CommonButton>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmAllOpen} onClose={() => setConfirmAllOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{
          display: "flex", justifyContent: "center", alignItems: "center",
          fontWeight: 700, fontSize: "20px", letterSpacing: 0.5,
          color: "error.main",
          pb: 1,
          position: "relative",
        }}>
          ADMIN: ACCEPT ALL ISSUE STAGE?
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText>
            Complete the Issue Stage for all items in this order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, gap: 0 }}>
          <CommonButton onClick={() => setConfirmAllOpen(false)}>
            CANCEL
          </CommonButton>
          <CommonButton
            onClick={() => {
              setConfirmAllOpen(false);
              onAcceptAllIssue?.();
            }}
            autoFocus
          >
            YES, ACCEPT ALL
          </CommonButton>
        </DialogActions>
      </Dialog>

      <UploadAttachmentDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        saleOrderNumber={saleOrderNumber}
        onUploaded={handleFileChange}
      />

      <Dialog open={confirmDeleteOpen} onClose={() => { if (!isDeleting) setConfirmDeleteOpen(false); }} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{
          display: "flex", justifyContent: "center", alignItems: "center",
          fontWeight: 700, fontSize: "20px", letterSpacing: 0.5,
          color: "error.main",
          pb: 1,
          position: "relative",
        }}>
          DELETE ERP DATA
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText>
            Delete the imported ERP data for this order? <br />
            This will reset status, priority, and assigned user. <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, pb: 2, gap: 0 }}>
          <CommonButton onClick={() => setConfirmDeleteOpen(false)} disabled={isDeleting}>
            CANCEL
          </CommonButton>
          <CommonButton
            onClick={handleDelete}
            type="button"
            disabled={isDeleting}
            autoFocus
          >
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : "YES, DELETE DATA"}
          </CommonButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InputBoxSection;