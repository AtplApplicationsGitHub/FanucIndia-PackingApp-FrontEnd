"use client";

import React from "react";
import { Fade, Box } from "@mui/material";

export default function PageAnimationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Fade in={true} timeout={800} style={{ transformOrigin: '0 0 0' }}>
      <Box sx={{ width: "100%", height: "100%" }}>
        {children}
      </Box>
    </Fade>
  );
}