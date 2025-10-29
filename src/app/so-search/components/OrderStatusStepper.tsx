"use client";

import { Stack, Step, StepLabel, Stepper, StepConnector, stepConnectorClasses, styled } from "@mui/material";
import { StepIconProps } from "@mui/material/StepIcon";
import { Check } from "@mui/icons-material";

const STEPPER_GREEN = '#4caf50';

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: STEPPER_GREEN,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: STEPPER_GREEN,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const QontoStepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
    ...(ownerState.active && {
      color: STEPPER_GREEN,
    }),
    "& .QontoStepIcon-completedIcon": {
      color: STEPPER_GREEN,
      zIndex: 1,
      fontSize: 18,
    },
    "& .QontoStepIcon-circle": {
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: "currentColor",
    },
  })
);

function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

const steps = [
  "Order Created",
  "Materials Issued",
  "Ready for Dispatch",
  "Dispatched",
];

export default function OrderStatusStepper({ status }: { status?: string }) {
  const getActiveStep = () => {
    if (!status) return 0;
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("dispatched")) return 3;
    if (lowerStatus === "f105") return 2; 
    if (lowerStatus === "r105") return 1; 
    return 0; 
  };

  const activeStep = getActiveStep();

  return (
    <Stack sx={{ width: "100%", mb: 1, mt: -2 }} spacing={4}>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<QontoConnector />}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Stack>
  );
}