import { Typography, Link } from "@mui/material";

export default function LoginSignupLink() {
  return (
    <Typography variant="body2" align="center" mt={1}>
      Don&apos;t have an account?{" "}
      <Link href="/signup" underline="hover" color="primary">
        Sign up
      </Link>
    </Typography>
  );
}
