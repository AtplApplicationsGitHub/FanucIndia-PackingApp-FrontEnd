"use client";

import { Stack, Step, StepLabel, Stepper, StepConnector, stepConnectorClasses, styled, Typography, Box } from "@mui/material";
import { StepIconProps } from "@mui/material/StepIcon";
import { differenceInSeconds, format } from 'date-fns'; // Added format

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient( 95deg,rgb(255, 234, 0) 0%,rgb(255, 210, 0) 50%,rgb(255, 200, 0) 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient( 95deg,rgb(255, 234, 0) 0%,rgb(255, 210, 0) 50%,rgb(255, 200, 0) 100%)',
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
      'linear-gradient( 136deg, #FFEA00 0%, #FFD200 50%, #E6BD00 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    color: '#1F2933', 
  }),
  ...(ownerState.completed && {
    backgroundImage:
      'linear-gradient( 136deg, #FFEA00 0%, #FFD200 50%, #E6BD00 100%)',
     color: '#1F2933', 
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
  "To be Issued",
  "Under Issue",
  "Issued",
  "Under Packing",
  "Packed",
  "WIP Storage",
  "Ready for Dispatch",
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

  } catch {
    return "Error";
  }
}

export default function OrderStatusStepper({ stepsData = [] }: Props) {
  
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
          if (index > 0) {
            const currentStepTime = step.createdDateTime;
            const prevStep = sortedSteps[index - 1];
            const prevStepTime = prevStep?.createdDateTime || null;
            
            timeTaken = calculateTimeTaken(prevStepTime, currentStepTime);
          }

          const isSkipped = !step.createdDateTime && index < activeStep;

          // Check specifically for "To be Issued" to display its created time
          const isToBeIssued = step.status === "To be Issued";
          const createdTimeFormatted = isToBeIssued && step.createdDateTime 
            ? format(new Date(step.createdDateTime), "dd MMM yyyy, hh:mm a") 
            : null;

          return (
            <Step key={step.id}>
              <StepLabel 
                StepIconComponent={(props) => (
                  <ColorlibStepIcon {...props} skipped={isSkipped} />
                )}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{step.status}</Typography>
                  
                  {/* Display Created Time for 'To be Issued' */}
                  {createdTimeFormatted && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {createdTimeFormatted}
                    </Typography>
                  )}

                  {index > 0 && ( 
                    <>
                      {step.createdDateTime ? (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Time Taken: {timeTaken || "..."}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color={isSkipped ? "text.disabled" : "text.secondary"} display="block">
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