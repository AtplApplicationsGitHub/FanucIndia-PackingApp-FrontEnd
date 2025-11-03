"use client";

import { Stack, Step, StepLabel, Stepper, StepConnector, stepConnectorClasses, styled, Typography, Box } from "@mui/material";
import { StepIconProps } from "@mui/material/StepIcon";
import { differenceInSeconds } from 'date-fns';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient( 95deg, rgb(139,195,74) 0%, rgb(76,175,80) 50%, rgb(56,142,60) 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient( 95deg, rgb(139,195,74) 0%, rgb(76,175,80) 50%, rgb(56,142,60) 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean; skipped?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundImage:
      'linear-gradient( 136deg, rgb(139,195,74) 0%, rgb(76,175,80) 50%, rgb(56,142,60) 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage:
      'linear-gradient( 136deg, rgb(139,195,74) 0%, rgb(76,175,80) 50%, rgb(56,142,60) 100%)',
  }),
  ...(ownerState.skipped && {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    color: theme.palette.mode === 'dark' ? theme.palette.grey[500] : '#bdbdbd',
  }),
}));

function ColorlibStepIcon(props: StepIconProps & { skipped?: boolean }) {
  const { active, completed, className, skipped } = props;

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active, skipped }} className={className}>
      {String(props.icon)}
    </ColorlibStepIconRoot>
  );
}

interface StatusStepperData {
  id: number;
  status: string;
  createdDateTime: string | null;
  updatedBy: string | null;
}

interface Props {
  status?: string; 
  stepsData: StatusStepperData[];
}

const STEP_ORDER = [
  "Created",
  "Assigned",
  "Issued",
  "Packed",
  "Stored/Ready for Dispatch",
  "Dispatched",
];

function formatTimeTaken(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  let remainder = totalSeconds % 86400;

  const hours = Math.floor(remainder / 3600);
  remainder = remainder % 3600;

  const minutes = Math.floor(remainder / 60);
  const seconds = remainder % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && minutes < 1 && hours < 1 && days < 1) parts.push(`${seconds}s`); 
  if (minutes > 0 && seconds > 0 && hours < 1 && days < 1) parts.push(`${seconds}s`); 

  if (parts.length === 0 && totalSeconds === 0) return "0s";
  
  if (days > 0 || hours > 0) {
    return [
      days > 0 ? `${days}d` : null,
      hours > 0 ? `${hours}h` : null,
      minutes > 0 ? `${minutes}m` : null,
    ].filter(Boolean).join(' ') || '0m'; 
  } else if (minutes > 0) {
    return [
      minutes > 0 ? `${minutes}m` : null,
      seconds > 0 ? `${seconds}s` : null,
    ].filter(Boolean).join(' ');
  } else {
    return `${seconds}s`;
  }
}

function calculateTimeTaken(start: string | null, end: string | null): string | null {
  if (!start || !end) {
    return null;
  }
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const totalSeconds = differenceInSeconds(endDate, startDate);
    
    if (totalSeconds < 0) return "Invalid Time";

    return formatTimeTaken(totalSeconds);

  } catch (e) {
    return "Error";
  }
}

export default function OrderStatusStepper({ status, stepsData = [] }: Props) {
  
  const sortedSteps = [...stepsData].sort((a, b) => {
    return STEP_ORDER.indexOf(a.status) - STEP_ORDER.indexOf(b.status);
  });

  let activeStep = 0;
  for (let i = sortedSteps.length - 1; i >= 0; i--) {
    if (sortedSteps[i].createdDateTime) {
      activeStep = i;
      break;
    }
  }
  
  return (
    <Stack sx={{ width: "100%", pt: 2, mb: 1, mt: -3 }} spacing={4}>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<ColorlibConnector />}
      >
        {sortedSteps.map((step, index) => {
          
          let timeTaken = null;
          if (index > 0) { // No time taken for "Created" step
            const currentStepTime = step.createdDateTime;
            let prevStepTime = null;

            // Check for the special "Dispatched" skip logic
            if (index === 5 && step.status === "Dispatched") {
              const storedStep = sortedSteps[4]; // "Stored/Ready for Dispatch"
              
              // If 'Stored' was skipped (no timestamp), use 'Packed' time
              if (storedStep && !storedStep.createdDateTime) {
                const packedStep = sortedSteps[3]; // "Packed"
                prevStepTime = packedStep?.createdDateTime || null;
              } else {
                // Otherwise, use the 'Stored' step time as normal
                prevStepTime = storedStep?.createdDateTime || null;
              }
            } else {
              // Default logic for all other steps
              const prevStep = sortedSteps[index - 1];
              prevStepTime = prevStep?.createdDateTime || null;
            }
            
            timeTaken = calculateTimeTaken(prevStepTime, currentStepTime);
          }

          const isSkipped = !step.createdDateTime && index < activeStep;

          return (
            <Step key={step.id}>
              <StepLabel 
                StepIconComponent={(props) => (
                  <ColorlibStepIcon {...props} skipped={isSkipped} />
                )}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{step.status}</Typography>
                  {index > 0 && ( 
                    <>
                      {step.createdDateTime ? (
                        <Typography variant="caption" color="text.secondary">
                          Time Taken: {timeTaken || "..."}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color={isSkipped ? "text.disabled" : "text.secondary"}>
                          {isSkipped ? "Skipped" : "Awaiting Completion"}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Stack>
  );
}