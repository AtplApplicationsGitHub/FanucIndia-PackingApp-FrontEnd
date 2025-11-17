import { CardHeader, Typography, Box } from "@mui/material";

export default function LoginHeader() {
  return (
    <CardHeader
      sx={{
        bgcolor: '#FFCC00', 
        color: '#000000', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        py: 3,
      }}
      title={
        <Box>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            textAlign="center"
            sx={{ 
              color: '#000000',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            SIGN IN
          </Typography>
        </Box>
      }
    />
  );
}