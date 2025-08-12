// "use client";

// import { FC } from 'react';
// import { useRouter } from 'next/navigation';
// import { Box, Typography, useTheme, Button } from '@mui/material';
// import { ArrowLeft } from 'lucide-react';

// interface HeaderProps {
//   so: string;
//   customerName: string;
//   transferOrder: string;
//   fgObd: string;
//   machineModel: string;
//   cncSerialNo: string;
// }

// const HeaderSection: FC<HeaderProps> = ({
//   so,
//   customerName,
//   transferOrder,
//   fgObd,
//   machineModel,
//   cncSerialNo,
// }) => {
//   const theme = useTheme();
//   const router = useRouter();

//   return (
//     <Box position="relative" width="100%" py={3} sx={{ backgroundColor: theme.palette.background.paper }}>
//       <Box position="absolute" top={16} left={16}>
//         <Button
//           variant="text"
//           startIcon={<ArrowLeft size={16} />}
//           onClick={() => router.back()}
//           sx={{
//             padding: '4px 8px',
//             color: theme.palette.text.primary,
//             textTransform: 'none',
//             '&:hover': {
//               backgroundColor: theme.palette.action.hover,
//             },
//           }}
//         >
//           Go Back
//         </Button>
//       </Box>

//       <Box
//         display="grid"
//         gridTemplateColumns="repeat(4, 1fr)"
//         gap={3}
//         alignItems="center"
//         mb={4}
//       >
//         {[
//           { label: 'SO', value: so },
//           { label: 'Customer Name', value: customerName },
//           { label: 'Transfer Order', value: transferOrder },
//           { label: 'FG OBD', value: fgObd },
//         ].map((item, i) => (
//           <Box key={i} textAlign="center">
//             <Typography variant="body2" color="text.secondary">
//               {item.label}:
//             </Typography>
//             <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
//               {item.value}
//             </Typography>
//           </Box>
//         ))}
//       </Box>

//       <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={3} alignItems="center">

//         <Box textAlign="center">
//           <Typography variant="body2" color="text.secondary">Machine Model:</Typography>
//           <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
//             {machineModel}
//           </Typography>
//         </Box>

//         <Box textAlign="center">
//           <Typography variant="body2" color="text.secondary">CNC Serial No:</Typography>
//           <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
//             {cncSerialNo}
//           </Typography>
//         </Box>

//       </Box>
//     </Box>
//   );
// };

// export default HeaderSection;

"use client";

import { FC, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, useTheme, Button, Tooltip } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import type { MaterialRow } from "@/app/admin/material-data/types/material-row";

interface HeaderProps {
  so: string;
  customerName: string;
  transferOrder: string;
  fgObd: string;
  machineModel: string;
  cncSerialNo: string;
  items: MaterialRow[]; // NEW
}

const HeaderSection: FC<HeaderProps> = ({
  so,
  customerName,
  transferOrder,
  fgObd,
  machineModel,
  cncSerialNo,
  items,
}) => {
  const theme = useTheme();
  const router = useRouter();

  // Derived KPIs
  const { totalItems, completedItems, sumRequired, sumPickedClamped } = useMemo(() => {
    const list = Array.isArray(items) ? items : [];

    const total = list.length;

    const completed = list.reduce((acc, it) => {
      const req = Math.max(0, Number(it.reqQuantity) || 0);
      const picked = Math.max(0, Number(it.issueStage) || 0);
      return acc + (req > 0 && picked >= req ? 1 : 0);
    }, 0);

    const reqSum = list.reduce((acc, it) => acc + Math.max(0, Number(it.reqQuantity) || 0), 0);

    const pickedSumClamped = list.reduce((acc, it) => {
      const req = Math.max(0, Number(it.reqQuantity) || 0);
      const picked = Math.max(0, Number(it.issueStage) || 0);
      return acc + Math.min(picked, req);
    }, 0);

    return {
      totalItems: total,
      completedItems: completed,
      sumRequired: reqSum,
      sumPickedClamped: pickedSumClamped,
    };
  }, [items]);

  return (
    <Box position="relative" width="100%" py={3} sx={{ backgroundColor: theme.palette.background.paper }}>
      {/* Back */}
      <Box position="absolute" top={16} left={16}>
        <Button
          variant="text"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => router.back()}
          sx={{
            padding: '4px 8px',
            color: theme.palette.text.primary,
            textTransform: 'none',
            '&:hover': { backgroundColor: theme.palette.action.hover },
          }}
        >
          Go Back
        </Button>
      </Box>

      {/* Row 1 */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(4, 1fr)"
        gap={3}
        alignItems="center"
        mb={4}
      >
        {[
          { label: 'SO', value: so },
          { label: 'Customer Name', value: customerName },
          { label: 'Transfer Order', value: transferOrder },
          { label: 'FG OBD', value: fgObd },
        ].map((item, i) => (
          <Box key={i} textAlign="center">
            <Typography variant="body2" color="text.secondary">{item.label}:</Typography>
            <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Row 2: existing + new columns */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(4, 1fr)" // was 4 → now 6
        gap={3}
        alignItems="center"
      >
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">Machine Model:</Typography>
          <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
            {machineModel}
          </Typography>
        </Box>

        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">CNC Serial No:</Typography>
          <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
            {cncSerialNo}
          </Typography>
        </Box>

        {/* NEW: Total items */}
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">Total items:</Typography>
          <Tooltip title="Completed materials / Total materials" arrow placement="top">
            <Typography
              variant="subtitle1"
              sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}
              aria-label="total-items-counter"
            >
              {completedItems}/{totalItems}
            </Typography>
          </Tooltip>
        </Box>

        {/* NEW: Required vs Picked */}
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">Required vs Picked:</Typography>
          <Tooltip title="Picked quantity (clamped) / Total required quantity" arrow placement="top">
            <Typography
              variant="subtitle1"
              sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}
              aria-label="required-vs-picked-counter"
            >
              {sumPickedClamped}/{sumRequired}
            </Typography>
          </Tooltip>
        </Box>

        {/* optional spacers to balance 6 columns */}
        <span />
        <span />
      </Box>
    </Box>
  );
};

export default HeaderSection;
