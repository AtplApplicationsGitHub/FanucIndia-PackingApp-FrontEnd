import { Alert, Typography } from "@mui/material";

export default function LocationAuditPage() {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Location Audit
      </Typography>

      <Alert severity="info">
        Location Audit creation requirements are pending.
      </Alert>
    </>
  );
}
