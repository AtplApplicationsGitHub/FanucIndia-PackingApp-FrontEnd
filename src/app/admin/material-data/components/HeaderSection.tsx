"use client";

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Paper, useTheme, Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  so: string;
  customerName: string;
  transferOrder: string;
  fgObd: string;
  machineModel: string;
  cncSerialNo: string;
}

const HeaderSection: FC<HeaderProps> = ({
  so,
  customerName,
  transferOrder,
  fgObd,
  machineModel,
  cncSerialNo,
}) => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Box position="relative" width="100%" py={3} sx={{ backgroundColor: theme.palette.background.paper }}>
      {/* Go Back Ghost Button */}
      <Box position="absolute" top={16} left={16}>
        <Button
          variant="text"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => router.back()}
          sx={{
            padding: '4px 8px',
            color: theme.palette.text.primary,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          Go Back
        </Button>
      </Box>

      {/* First Row */}
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
            <Typography variant="body2" color="text.secondary">
              {item.label}:
            </Typography>
            <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Second Row */}
      <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={3} alignItems="center">
        {/* Left Barcode */}
        <Box display="flex" justifyContent="center">
          <Paper
            elevation={0}
            sx={{
              width: 144,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(to right, #1f1f1f, #333)'
                : 'linear-gradient(to right, #f3f4f6, #d1d5db)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" sx={{ letterSpacing: 4, color: theme.palette.text.secondary }}>
              |||
            </Typography>
          </Paper>
        </Box>

        {/* Machine Model */}
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">Machine Model:</Typography>
          <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
            {machineModel}
          </Typography>
        </Box>

        {/* CNC Serial No */}
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">CNC Serial No:</Typography>
          <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
            {cncSerialNo}
          </Typography>
        </Box>

        {/* Right Barcode */}
        <Box display="flex" justifyContent="center">
          <Paper
            elevation={0}
            sx={{
              width: 144,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(to right, #1f1f1f, #333)'
                : 'linear-gradient(to right, #f3f4f6, #d1d5db)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" sx={{ letterSpacing: 4, color: theme.palette.text.secondary }}>
              |||
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default HeaderSection;
