"use client";

import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import CommonButton from "@/common/components/CommonButton";
import { FREE_STOCK_COLUMNS, type FreeStockRow } from "../types/freeStock";

type Props = {
  row: FreeStockRow | null;
  mode: "view" | "release" | null;
  onClose: () => void;
  onRequestRelease: () => void;
  onConfirmRelease: () => void;
};

export default function FreeStockDetailDialog({
  row,
  mode,
  onClose,
  onRequestRelease,
  onConfirmRelease,
}: Props) {
  return (
    <Dialog
      open={Boolean(row && mode)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      {row && mode === "view" && (
        <>
          <DialogTitle sx={{ pb: 0.5, fontSize: 17, fontWeight: 700 }}>
            {row.Material} · {row.Batch}
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Status: {row.status}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "130px minmax(0, 1fr)",
                gap: 1,
                fontSize: 13,
              }}
            >
              {FREE_STOCK_COLUMNS.map((column) => (
                <Box key={column} sx={{ display: "contents" }}>
                  <Typography variant="body2" color="text.secondary">
                    {column}
                  </Typography>
                  <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                    {row[column] === "" ? "—" : row[column]}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "130px minmax(0, 1fr)",
                gap: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Hold
              </Typography>
              <Typography variant="body2">
                {row.heldBy
                  ? "Whole batch locked"
                  : "Free, not held by any user"}
              </Typography>
              {row.heldBy && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Held by
                  </Typography>
                  <Typography variant="body2">{row.heldBy}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Held qty
                  </Typography>
                  <Typography variant="body2">
                    {row.heldQty} of {row.Stock}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Days held
                  </Typography>
                  <Typography variant="body2">{row.daysHeld} d</Typography>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <CommonButton onClick={onClose}>Close</CommonButton>
            {row.heldBy && (
              <CommonButton
                onClick={onRequestRelease}
                sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
              >
                Release hold
              </CommonButton>
            )}
          </DialogActions>
        </>
      )}
      {row && mode === "release" && (
        <>
          <DialogTitle sx={{ fontSize: 17, fontWeight: 700 }}>
            Release hold?
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              {row.Material} · {row.Batch} is held by{" "}
              <strong>{row.heldBy}</strong> ({row.heldQty} qty, {row.daysHeld}{" "}
              days). The batch becomes available again.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <CommonButton onClick={onClose}>Cancel</CommonButton>
            <CommonButton
              onClick={onConfirmRelease}
              sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
            >
              Release
            </CommonButton>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
