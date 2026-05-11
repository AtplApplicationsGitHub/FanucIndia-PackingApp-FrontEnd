"use client";

import { Stack, Step, StepLabel, Stepper, StepConnector, stepConnectorClasses, styled, Typography, Box } from "@mui/material";
import { StepIconProps } from "@mui/material/StepIcon";
import { differenceInSeconds, format } from 'date-fns'; 
import FlagIcon from '@mui/icons-material/Flag';
import { formatDateTimeIST } from "@/common/utils/dateTime";

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
  ownerState: { completed?: boolean; active?: boolean; customColor?: 'blue' | 'red' | 'purple' };
}>(({ theme, ownerState }) => {
  let backgroundImage = 'linear-gradient( 136deg, #FFEA00 0%, #FFD200 50%, #E6BD00 100%)';
  
  if (ownerState.customColor === 'blue') {
    backgroundImage = 'linear-gradient( 136deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)';
  } else if (ownerState.customColor === 'red') {
    backgroundImage = 'linear-gradient( 136deg, #f87171 0%, #ef4444 50%, #dc2626 100%)';
  } else if (ownerState.customColor === 'purple') {
    backgroundImage = 'linear-gradient( 136deg, #c084fc 0%, #a855f7 50%, #9333ea 100%)';
  }

  return {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...((ownerState.active || ownerState.completed || ownerState.customColor) && {
      backgroundImage,
      boxShadow: ownerState.active ? '0 4px 10px 0 rgba(0,0,0,.25)' : 'none',
      color: ownerState.customColor ? '#fff' : '#1F2933', 
    }),
  };
});

function ColorlibStepIcon(props: StepIconProps & { isCompletedCustom?: boolean, isActiveCustom?: boolean, customColor?: 'blue' | 'red' | 'purple' }) {
  const { className, isCompletedCustom, isActiveCustom, customColor } = props;
  return (
    <ColorlibStepIconRoot ownerState={{ completed: isCompletedCustom, active: isActiveCustom, customColor }} className={className}>
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
  skipIssueStage?: boolean | null;  // <-- ADD THIS
  skipPackingStage?: boolean | null; // <-- ADD THIS
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
    
    let totalSeconds = differenceInSeconds(endDate, startDate);
    
    if (totalSeconds < 0) {
      if (totalSeconds >= -60) {
        totalSeconds = 0;
      } else {
        return "Invalid Time";
      }
    }

    return formatTimeTaken(totalSeconds);

  } catch {
    return "Error";
  }
}

export default function OrderStatusStepper({ 
  stepsData = [], 
  skipIssueStage,
  skipPackingStage
}: Props) {
  
  const sortedSteps = [...stepsData].sort((a, b) => {
    return STEP_ORDER.indexOf(a.status) - STEP_ORDER.indexOf(b.status);
  });

  //  Pre-calculate chronological steps for accurate out-of-sequence time tracking
  const chronologicalSteps = [...stepsData]
    .filter(s => s.createdDateTime)
    .sort((a, b) => new Date(a.createdDateTime!).getTime() - new Date(b.createdDateTime!).getTime());

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
          const hasTimestamp = !!step.createdDateTime;
          
          if (index > 0 && hasTimestamp) {
            const myIndex = chronologicalSteps.findIndex(s => s.id === step.id);
            if (myIndex > 0) {
              const prevStepTime = chronologicalSteps[myIndex - 1].createdDateTime;
              timeTaken = calculateTimeTaken(prevStepTime, step.createdDateTime);
            }
          }
          
          const isToBeIssued = step.status === "To be Issued";
          const createdTimeFormatted = isToBeIssued && step.createdDateTime 
            ? formatDateTimeIST(step.createdDateTime) 
            : null;
          const isActive = index === activeStep;

          // --- NEW: Calculate flag color for skipped stages ---
          let flagColor: string | null = null;
          
          if (skipIssueStage && skipPackingStage) {
            if (step.status === 'Issued' || step.status === 'Packed') flagColor = '#a855f7'; // Purple
          } else if (skipIssueStage && !skipPackingStage) {
            if (step.status === 'Issued') flagColor = '#3b82f6'; // Blue
          } else if (!skipIssueStage && skipPackingStage) {
            if (step.status === 'Packed') flagColor = '#ef4444'; // Red
          }
          // --------------------------------------------------

          return (
            <Step key={step.id}>
              <StepLabel 
                StepIconComponent={(props) => (
                  <ColorlibStepIcon 
                    {...props} 
                    isCompletedCustom={hasTimestamp} 
                    isActiveCustom={isActive} 
                  />
                )}
              >
                <Box>
                  {/* Container uses relative positioning so the absolute icon anchors to it */}
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {step.status}
                    </Typography>
                    
                    {flagColor && (
                      <FlagIcon 
                        sx={{ 
                          color: flagColor, 
                          fontSize: 18,
                          position: 'absolute',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          right: -22 // Pulls the icon outside the text boundary
                        }} 
                      />
                    )}
                  </Box>
                  
                  {createdTimeFormatted && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {createdTimeFormatted}
                    </Typography>
                  )}
                  {index > 0 && (
                    <>
                      {/* Sub-text logic is now completely independent of the flag */}
                      {hasTimestamp ? (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Time Taken: {timeTaken || "0s"}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Pending
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