"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import CommonButton from "@/common/components/CommonButton";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { showGlobalMessage } from "../../utils/auditEvents";
import { ibdError } from "../../hooks/ibd/useIbdUploads";
import type { IbdPrinter } from "../../types/ibd";

type Props = {
  open: boolean;
  onClose: () => void;
  uploadId: number;
  /** Selected row ids. Empty = print every row of the upload. */
  rowIds: number[];
  totalRows: number;
};

/** Same "PRINT ORDER LABEL" dialog and printers API as the order page. */
export default function IbdPrintDialog({
  open,
  onClose,
  uploadId,
  rowIds,
  totalRows,
}: Props) {
  const [printers, setPrinters] = useState<IbdPrinter[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [printing, setPrinting] = useState(false);
  const [userId, setUserId] = useState<string | number | null>(null);

  // Remembered printer (same localStorage key as the order page) + printers list
  useEffect(() => {
    if (!open) return;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserId(user.id ?? null);
      const saved = user.id
        ? localStorage.getItem(`printer_pref_${user.id}`)
        : null;
      if (saved) setSelectedPrinter(Number(saved));
    } catch {
      /* ignore */
    }

    void (async () => {
      try {
        const res = await fetchWithAuth(API.LOOKUP.PRINTERS);
        const json = await res.json().catch(() => []);
        if (!res.ok) throw new Error(ibdError(json, "Failed to load printers."));
        setPrinters(Array.isArray(json) ? json : []);
      } catch (e) {
        showGlobalMessage(
          e instanceof Error ? e.message : "Failed to load printers.",
          "error",
        );
      }
    })();
  }, [open]);

  const handlePrint = async () => {
    if (selectedPrinter === "") return;
    setPrinting(true);
    try {
      const res = await fetchWithAuth(API.IBD_PRINT.PRINT(uploadId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printerId: Number(selectedPrinter),
          quantity,
          ...(rowIds.length ? { rowIds } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(ibdError(json, "Failed to print labels."));

      showGlobalMessage(
        `Print job submitted (${json.totalLabels ?? 0} labels).`,
        "success",
      );
      onClose();
    } catch (e) {
      showGlobalMessage(
        e instanceof Error ? e.message : "Failed to print labels.",
        "error",
      );
    } finally {
      setPrinting(false);
    }
  };

  const rowText = rowIds.length
    ? `${rowIds.length} selected row${rowIds.length > 1 ? "s" : ""}`
    : `all ${totalRows} rows`;

  return (
    <Dialog open={open} onClose={printing ? undefined : onClose} maxWidth="xs" fullWidth>
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
        PRINT ORDER LABEL
        <IconButton
          onClick={onClose}
          size="small"
          disabled={printing}
          sx={{ position: "absolute", right: 12 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}
      >
        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
          <InputLabel>Printer</InputLabel>
          <Select
            value={selectedPrinter}
            label="Printer"
            onChange={(e) => {
              const val = e.target.value as number | "";
              setSelectedPrinter(val);
              if (val !== "" && userId) {
                localStorage.setItem(`printer_pref_${userId}`, String(val));
              }
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {printers.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Quantity"
          type="number"
          size="small"
          value={quantity}
          onChange={(e) => {
            let val = parseInt(e.target.value, 10);
            if (isNaN(val)) val = 1;
            if (val > 10) val = 10;
            if (val < 1) val = 1;
            setQuantity(val);
          }}
          inputProps={{ min: 1, max: 10 }}
          helperText={`Copies per row - printing ${rowText}`}
          fullWidth
        />
        {printers.length === 0 && (
          <Typography variant="caption" color="text.secondary">
            No printers found.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <CommonButton
          onClick={handlePrint}
          disabled={printing || selectedPrinter === ""}
        >
          {printing ? "PRINTING..." : "PRINT"}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
}
