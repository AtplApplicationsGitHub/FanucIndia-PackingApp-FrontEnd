import { Alert, Box, Typography } from "@mui/material";
import { FreeStockApiError } from "../../../utils/free-stock/freeStockErrors";
export default function FreeStockError({ error }: { error: Error | null }) {
  if (!error) return null;
  return (
    <Alert severity="error" sx={{ my: 1, whiteSpace: "pre-wrap" }}>
      {error.message}
      {error instanceof FreeStockApiError && error.details.length > 0 && (
        <Box sx={{ maxHeight: 180, overflowY: "auto", mt: 1 }}>
          {error.details.map((detail, index) => (
            <Typography key={index} variant="body2">
              {detail}
            </Typography>
          ))}
        </Box>
      )}
    </Alert>
  );
}
