import { Box, Typography } from "@mui/material";

export default function LoginDemoCredentials() {
  return (
    <Box textAlign="center" width="100%" mt={2}>
      <Typography variant="caption" color="text.secondary">
        Admin Demo: admin@fanuc.com / FanucAdmin123 <br />
        Sales Demo: user1@example.com / Demo123!@# <br />
        User Demo: t1@gmail.com / Password12$$
      </Typography>
    </Box>
  );
}
