'use client';

import { Box, Card, CardHeader } from "@mui/material";
import AnimatedPage from "@/common/components/AnimatedPage";
import SignupForm from "@/app/signup/components/SignupForm";

export default function SignupPage() {
  return (
    <AnimatedPage>
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={2}
        sx={{
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(to bottom right, #1e1e1e, #121212)"
              : "linear-gradient(to bottom right, #f5f5f5, #ffffff)",
        }}
      >
        <Card
          sx={{
            maxWidth: 450,
            width: "100%",
            borderRadius: 3,
            boxShadow: 4,
          }}
        >
          <CardHeader
            title="Create an Account"
            subheader="Signup as a Sales User"
            slotProps={{
              title: {
                variant: "h5",
                fontWeight: 600,
                align: "center",
              },
              subheader: {
                variant: "body2",
                color: "text.secondary",
                align: "center",
              },
            }}
          />
          <SignupForm />
        </Card>
      </Box>
    </AnimatedPage>
  );
}
