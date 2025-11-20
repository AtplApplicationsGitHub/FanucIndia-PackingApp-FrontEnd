"use client";

import { FC, useMemo, useEffect, useState } from 'react';
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
  items: MaterialRow[];
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
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role);
      } catch {}
    }
  }, []);

  const handleGoBack = () => {
    if (userRole === 'user') {
      sessionStorage.setItem('userDashboardView', 'pick_pack');
      router.push('/user/dashboard');
    } else {
      router.back();
    }
  };

  const {
    totalItems,
    completedIssuedItems,
    sumRequired,
    sumIssuedClamped,
    completedPackedItems,
    sumPackedClamped,
    isIssuingComplete,
  } = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    if (list.length === 0) {
      return {
        totalItems: 0,
        completedIssuedItems: 0,
        sumRequired: 0,
        sumIssuedClamped: 0,
        completedPackedItems: 0,
        sumPackedClamped: 0,
        isIssuingComplete: false,
      };
    }

    const total = list.length;
    const reqSum = list.reduce((acc, it) => acc + Math.max(0, Number(it.reqQuantity) || 0), 0);

    const completedIssued = list.reduce((acc, it) => {
      const req = Math.max(0, Number(it.reqQuantity) || 0);
      const issued = Math.max(0, Number(it.issueStage) || 0);
      return acc + (req > 0 && issued >= req ? 1 : 0);
    }, 0);

    const issuedSumClamped = list.reduce((acc, it) => {
      const req = Math.max(0, Number(it.reqQuantity) || 0);
      const issued = Math.max(0, Number(it.issueStage) || 0);
      return acc + Math.min(issued, req);
    }, 0);

    const completedPacked = list.reduce((acc, it) => {
      const req = Math.max(0, Number(it.reqQuantity) || 0);
      const packed = Math.max(0, Number(it.packingStage) || 0);
      return acc + (req > 0 && packed >= req ? 1 : 0);
    }, 0);

    const packedSumClamped = list.reduce((acc, it) => {
      const req = Math.max(0, Number(it.reqQuantity) || 0);
      const packed = Math.max(0, Number(it.packingStage) || 0);
      return acc + Math.min(packed, req);
    }, 0);

    const allIssued = completedIssued === total;

    return {
      totalItems: total,
      sumRequired: reqSum,
      completedIssuedItems: completedIssued,
      sumIssuedClamped: issuedSumClamped,
      completedPackedItems: completedPacked,
      sumPackedClamped: packedSumClamped,
      isIssuingComplete: allIssued,
    };
  }, [items]);

  const kpiView = isIssuingComplete ? 'packing' : 'issue';

  return (
    <Box position="relative" width="100%" py={3} sx={{ backgroundColor: theme.palette.background.paper }}>
      <Box position="absolute" top={16} left={16}>
        <Button
          variant="text" 
          startIcon={<ArrowLeft size={16} />}
          onClick={handleGoBack}
          sx={{
            bgcolor: (theme) => theme.palette.action.hover,
            color: (theme) => theme.palette.text.primary,
            borderRadius: 0,
            clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
            fontWeight: 600,
            fontSize: 15,
            minWidth: 120,
            height: 40,
            px: 3,
            textTransform: "none",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: (theme) => theme.palette.primary.main,
              color: (theme) => theme.palette.primary.contrastText,
              boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
              "& .MuiSvgIcon-root, & svg": {
                color: "#000",
              },
            },
          }}
        >
          BACK
        </Button>
      </Box>

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

      <Box
        display="grid"
        gridTemplateColumns="repeat(4, 1fr)"
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

        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            {kpiView === 'issue' ? 'Total Issued:' : 'Total Packed:'}
          </Typography>
          <Tooltip title={kpiView === 'issue' ? "Completed Issued / Total materials" : "Completed Packed / Total materials"} arrow placement="top">
            <Typography
              variant="subtitle1"
              sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}
            >
              {kpiView === 'issue' ? `${completedIssuedItems}/${totalItems}` : `${completedPackedItems}/${totalItems}`}
            </Typography>
          </Tooltip>
        </Box>
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            {kpiView === 'issue' ? 'Required vs Issued:' : 'Required vs Packed:'}
          </Typography>
          <Tooltip title={kpiView === 'issue' ? "Issued quantity (clamped) / Total required quantity" : "Packed quantity (clamped) / Total required quantity"} arrow placement="top">
            <Typography
              variant="subtitle1"
              sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}
            >
              {kpiView === 'issue' ? `${sumIssuedClamped}/${sumRequired}` : `${sumPackedClamped}/${sumRequired}`}
            </Typography>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default HeaderSection;
