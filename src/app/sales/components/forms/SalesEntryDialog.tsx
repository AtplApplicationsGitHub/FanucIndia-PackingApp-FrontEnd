import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Box } from "@mui/material";
import SalesEntryForm from "@/app/sales/components/forms/SalesEntryForm";
import { SalesOrder, LookupData } from "@/app/sales/components/types/sales";
import Divider from "@mui/material/Divider";
import CommonButton from "@/common/components/CommonButton";

type Props = {
  open: boolean;
  onClose: () => void;
  initialData?: SalesOrder | null;
  lookup: LookupData;
  onSuccess: () => void;
};

export default function SalesEntryDialog({
  open,
  onClose,
  initialData,
  lookup,
  onSuccess,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            minHeight: "unset",
            maxHeight: "95vh",
            bgcolor: "background.paper",
            borderRadius: 0,
            overflow: "hidden",
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          bgcolor: "background.paper",
          px: 3,
          py: 1.5,
        }}
      >
        <Box
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: 20,
            flexGrow: 1,
            textAlign: "center",
            letterSpacing: 0,
            color: "secondary.main",
            p:1
          }}
        >
          {initialData ? "EDIT ORDER" : "CREATE ORDER"}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 12,
            color: "text.primary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <DialogContent
        sx={{
          p: { xs: 1.5, md: 2 },
          overflowY: "auto",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <SalesEntryForm
            initialData={initialData}
            lookup={lookup}
            onSuccess={onSuccess}
          />
        </Box>
      </DialogContent>
      <Divider />
      <Box sx={{ px: 3, py: 1, display: "flex", justifyContent: "flex-end", bgcolor: "background.paper" }}>
        <CommonButton type="submit" form="sales-entry-form">
          {initialData ? "Update" : "Save"}
        </CommonButton>
      </Box>
    </Dialog>
  );
}
