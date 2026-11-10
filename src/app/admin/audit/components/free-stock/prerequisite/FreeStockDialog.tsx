"use client";
import type { ReactNode } from "react";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton } from "@mui/material";
import type { DialogProps } from "@mui/material";
import { X } from "lucide-react";
type Props = { title: string; titleDetails?: ReactNode; onClose: () => void; children: ReactNode; actions?: ReactNode; busy?: boolean; maxWidth?: DialogProps["maxWidth"] };
export default function FreeStockDialog({ title, titleDetails, onClose, children, actions, busy = false, maxWidth = "md" }: Props) {
  return <Dialog open fullWidth maxWidth={maxWidth} disableEscapeKeyDown={busy} onClose={busy ? undefined : onClose} PaperProps={{ sx: { borderRadius: 2, m: { xs: 1.5, sm: 4 }, width: { xs: "calc(100% - 24px)", sm: "calc(100% - 64px)" }, maxHeight: "calc(100% - 32px)", minWidth: 0 } }}>
    <DialogTitle sx={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", fontWeight: 700, fontSize: 20, letterSpacing: 0.5, color: "error.main", textTransform: "uppercase", textAlign: "center", py: 1.25, px: 5.5, overflowWrap: "anywhere", minHeight: 48 }}>
      <Box component="span" sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 1, minWidth: 0 }}><Box component="span">{title}</Box>{titleDetails && <Box component="span" sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0.75, minWidth: 0, color: "text.primary", textTransform: "none", letterSpacing: 0 }}>{titleDetails}</Box>}</Box><IconButton onClick={onClose} disabled={busy} size="small" aria-label={`Close ${title}`} sx={{ position: "absolute", right: 12, top: 10 }}><X size={18} /></IconButton>
    </DialogTitle>
    <Divider />
    <DialogContent sx={{ pt: "12px !important", pb: 2, px: { xs: 1.5, sm: 2 }, minWidth: 0, overflowX: "hidden" }}>{children}</DialogContent>
    {actions && <DialogActions sx={{ px: 2, pb: 2, flexWrap: "wrap", gap: 1 }}>{actions}</DialogActions>}
  </Dialog>;
}
