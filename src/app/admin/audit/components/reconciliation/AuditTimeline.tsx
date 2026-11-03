"use client";

import type { ReactNode } from "react";

import {
  Paper,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  Typography,
  stepConnectorClasses,
  styled,
  Box,
} from "@mui/material";

import { formatDateTime } from "../../utils/reconLabels";

export type AuditTimelineStep = {
  key: string;
  label: string;
  icon: ReactNode;
  /** Date-time from the API, null until the step happens */
  at: string | null;
  /** Shown under the time (only the Created step uses it) */
  by?: string | null;
  /** Enabled (yellow) once the step is reached */
  reached: boolean;
};

const CIRCLE = "linear-gradient(136deg, #FFEA00 0%, #FFD200 50%, #E6BD00 100%)";
const LINE =
  "linear-gradient(95deg, rgb(255, 234, 0) 0%, rgb(255, 210, 0) 50%, rgb(255, 200, 0) 100%)";

const Connector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 19 },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}, &.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]:
    { backgroundImage: LINE },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    borderRadius: 1,
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
  },
}));

const IconRoot = styled("div", {
  shouldForwardProp: (p) => p !== "reached" && p !== "current",
})<{ reached: boolean; current: boolean }>(({ theme, reached, current }) => ({
  zIndex: 1,
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  ...(reached && {
    backgroundImage: CIRCLE,
    color: "#1F2933",
    boxShadow: current ? "0 4px 10px 0 rgba(0,0,0,.25)" : "none",
  }),
}));

export default function AuditTimeline({
  steps,
}: {
  steps: AuditTimelineStep[];
}) {
  // last step that has been reached = the highlighted one
  const current = steps.reduce((last, s, i) => (s.reached ? i : last), 0);

  return (
    <Box sx={{ overflowX: "auto", pt: 0.5 }}>
      <Stepper
        alternativeLabel
        activeStep={current}
        connector={<Connector />}
        sx={{ minWidth: 560 }}
      >
        {steps.map((s, i) => (
          <Step key={s.key} completed={s.reached}>
            <StepLabel
              sx={{
                "& .MuiStepLabel-label.MuiStepLabel-alternativeLabel": {
                  marginTop: "6px",
                },
              }}
              StepIconComponent={() => (
                <IconRoot reached={s.reached} current={i === current}>
                  {s.icon}
                </IconRoot>
              )}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  color: s.reached ? "text.primary" : "text.disabled",
                }}
              >
                {s.label}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ lineHeight: 1.3 }}
                color={s.reached ? "text.secondary" : "text.disabled"}
              >
                {s.at ? formatDateTime(s.at) : "—"}
                {s.at && s.by ? ` · by ${s.by}` : ""}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
