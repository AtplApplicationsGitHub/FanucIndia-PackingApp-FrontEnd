import { Box, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

export const KVBox = ({
  label,
  value,
  children,
  fullWidth = false,
  valueSx,
}: {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
  fullWidth?: boolean;
  valueSx?: SxProps<Theme>;
}) => (
  <Box
    sx={{
      flex: fullWidth ? "1 1 100%" : "1 1 23%",
      minWidth: fullWidth ? "100%" : "200px",
      border: "1px dashed #e5e7eb",
      borderRadius: "10px",
      p: "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }}
  >
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: ".02em" }}
    >
      {label}
    </Typography>
    <Typography
      variant="body1"
      fontWeight={600}
      sx={{ 
        whiteSpace: "pre-wrap", 
        wordBreak: "break-word",
        overflowWrap: "break-word",
        ...valueSx 
      }}
    >
      {children || value || "—"}
    </Typography>
  </Box>
);