import { Snackbar, Alert } from "@mui/material";

interface LoginSnackbarProps {
  open: boolean;
  onClose: (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => void;
}

export default function LoginSnackbar({
  open,
  onClose,
}: LoginSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        severity="success"
        sx={{ width: "100%" }}
        onClose={onClose}
      >
        You have been logged out.
      </Alert>
    </Snackbar>
  );
}
