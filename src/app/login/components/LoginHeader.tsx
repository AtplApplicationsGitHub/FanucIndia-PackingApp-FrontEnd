import { CardHeader, Typography } from "@mui/material";

export default function LoginHeader() {
  return (
    <CardHeader
      title={
        <Typography variant="h5" fontWeight={600} textAlign="center">
          Welcome Back
        </Typography>
      }
      subheader={
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
        >
          Sign in to your account
        </Typography>
      }
    />
  );
}
