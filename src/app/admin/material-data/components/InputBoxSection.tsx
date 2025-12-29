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
  useTheme
} from "@mui/material";
import UploadErpMaterialFileButton from "@/app/admin/material-data/components/UploadErpMaterialFileButton";
import UploadAttachmentDialog from "@/app/admin/material-data/components/UploadAttachmentDialog";
import { MaterialRow } from "../types/material-row";
import { getMaterialFilesBySaleOrder } from "@/common/services/materialFile.service";

interface Props {
  onSubmit: (value: string) => void;
  saleOrderNumber: string;
  onFileCreated: () => void;
  disabled?: boolean;
  items: MaterialRow[];
  uniqueGroups?: string[];
  selectedGroup?: string | null;
  onGroupChange?: (group: string | null) => void;
  onBulkAccept?: () => void;
  showBulkButton?: boolean; // [UPDATED] Boolean passed from parent
  showAll: boolean; // [NEW]
  onToggleShowAll: (val: boolean) => void; // [NEW]
  showAcceptAllIssueButton?: boolean; 
  onAcceptAllIssue?: () => void;
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

  const formattedDate = new Date(lastUpdatedItem.updatedDate).toLocaleString(
    "en-IN",
    { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }
  );

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
  uniqueGroups = [],
  selectedGroup = null,
  onGroupChange,
  onBulkAccept,
  showBulkButton = false,
  showAll,
  onToggleShowAll,
  showAcceptAllIssueButton = false,
  onAcceptAllIssue,
}) => {
  const theme = useTheme();
  const [value, setValue] = useState("");
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fileCount, setFileCount] = useState<number>(0);
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);

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

  const buttonSx = {
    bgcolor: (theme: Theme) => theme.palette.action.hover, 
    color: (theme: Theme) => theme.palette.text.primary,
    borderRadius: 0,
    clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
    fontWeight: 600,
    fontSize: 15,
    minWidth: 112,
    height: 40,
    px: 3,
    whiteSpace: "nowrap",
    textTransform: "none" as const,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      bgcolor: (theme: Theme) => theme.palette.primary.main, 
      color: (theme: Theme) => theme.palette.primary.contrastText,
      boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
      "& .MuiSvgIcon-root, & svg": {
        color: "#000",
      },
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    },
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

          <Button type="submit" sx={buttonSx} disabled={disabled}>
            SUBMIT
          </Button>

          {showBulkButton && (
            <Button
              variant="contained"
              onClick={() => setConfirmOpen(true)}
              sx={buttonSx}
              disabled={disabled}
            >
              ACCEPT GROUP ITEMS
            </Button>
          )}

          {showAcceptAllIssueButton && (
            <Button
              variant="contained"
              onClick={() => setConfirmAllOpen(true)}
              sx={buttonSx}
              disabled={disabled}
            >
              ACCEPT ALL
            </Button>
          )}

          <UploadErpMaterialFileButton
            saleOrderNumber={saleOrderNumber}
            onCreated={handleFileChange}
            onOpenDialog={() => setOpenUploadDialog(true)}
            buttonProps={{ type: "button", disabled: disabled }}
          />

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
          <Button 
            onClick={() => setConfirmOpen(false)} 
            sx={buttonSx} 
          >
            NO
          </Button>
          
          <Button
            onClick={() => {
              setConfirmOpen(false);
              onBulkAccept?.();
            }}
            sx={buttonSx}
            autoFocus
          >
            YES, ACCEPT ALL
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmAllOpen} onClose={() => setConfirmAllOpen(false)}>
        <DialogTitle sx={{ color: theme.palette.warning.main, fontWeight: 700, textTransform: 'uppercase' }}>
          ADMIN: Accept All Issue Stage?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to COMPLETE the Issue Stage for <strong>ALL ITEMS</strong> in this order?
            <br /><br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setConfirmAllOpen(false)} sx={buttonSx}>
            CANCEL
          </Button>
          <Button
            onClick={() => {
              setConfirmAllOpen(false);
              onAcceptAllIssue?.();
            }}
            sx={buttonSx}
            autoFocus
          >
            YES, ACCEPT ALL
          </Button>
        </DialogActions>
      </Dialog>

      <UploadAttachmentDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        saleOrderNumber={saleOrderNumber}
        onUploaded={handleFileChange}
      />
    </div>
  );
};

export default InputBoxSection;