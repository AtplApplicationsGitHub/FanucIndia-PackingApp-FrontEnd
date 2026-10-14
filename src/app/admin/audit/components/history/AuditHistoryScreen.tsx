import { Alert, Typography } from "@mui/material";

export default function AuditHistoryScreen() {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Audit History
      </Typography>

      <Alert severity="info">
        Completed audit history will be implemented after the requirements are
        confirmed.
      </Alert>
    </>
  );
}
