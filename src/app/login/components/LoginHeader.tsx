import { CardHeader, Typography, Box } from "@mui/material";

export default function LoginHeader() {
  return (
    <CardHeader
      sx={{
        bgcolor: '#FFCC00', 
        color: '#000000', 
        borderBottom: '3px solid #000000',
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