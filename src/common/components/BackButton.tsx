"use client";

import React from "react";
import { Button } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();

  return (
    <Button
      startIcon={<ArrowLeft size={20} />}
      onClick={() => router.back()} // Triggers the native browser back
      disableRipple
      sx={{
        mb: 2,
        fontWeight: 600,
        color: "text.secondary",
        textTransform: "none",
        fontSize: "1rem",
        "&:hover": {
          color: "primary.main",
          bgcolor: "transparent",
        },
      }}
    >
      {label}
    </Button>
  );
}