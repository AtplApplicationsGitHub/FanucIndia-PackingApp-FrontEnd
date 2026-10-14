import { Alert, Typography } from "@mui/material";

export default function ReconciliationScreen() {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Discrepancy & Reconciliation
      </Typography>

      <Alert severity="info">
        Reconciliation requirements are pending confirmation.
      </Alert>
    </>
  );
}
