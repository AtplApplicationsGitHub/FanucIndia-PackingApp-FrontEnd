"use client";

import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  alpha,
  useTheme
} from "@mui/material";
import { Users } from "lucide-react";
import { useOperatorStats } from "../hooks/useOperatorStats";

export default function OperatorStatsTable({ selectedDate }: { selectedDate: string }) {
  const theme = useTheme();
  // Ensure your useOperatorStats hook maps the new properties if it has strict TypeScript interfaces
  const { data, loading, error } = useOperatorStats(selectedDate);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-3">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
            OPERATOR PRODUCTIVITY
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Issue & Packing Stage Tracking
          </Typography>
        </div>
      </Box>

      {error ? (
        <Typography color="error" variant="body2">{error}</Typography>
      ) : (
        <TableContainer sx={{ flexGrow: 1, maxHeight: 400, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: "background.paper" }}>OPERATOR NAME</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "background.paper", fontSize: '0.75rem' }}>ISSUE<br/>ASSIGNED</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "background.paper", fontSize: '0.75rem' }}>ISSUE<br/>COMPLETED</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "background.paper", fontSize: '0.75rem' }}>PACKING<br/>ASSIGNED</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "background.paper", fontSize: '0.75rem' }}>PACKING<br/>COMPLETED</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>Loading...</TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>No operators found.</TableCell>
                </TableRow>
              ) : (
                data.map((row: any, idx: number) => (
                  <TableRow 
                    key={idx}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: alpha(theme.palette.primary.main, 0.02) },
                      "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.05) }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{row.operatorName}</TableCell>
                    
                    {/* ISSUE ASSIGNED (Blue) */}
                    <TableCell align="center">
                      <Box sx={{ 
                        display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, 
                        bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', fontWeight: 600
                      }}>
                        {row.issueAssigned}
                      </Box>
                    </TableCell>

                    {/* ISSUE COMPLETED (Green) */}
                    <TableCell align="center">
                      <Box sx={{ 
                        display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, 
                        bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 600
                      }}>
                        {row.issueCompleted}
                      </Box>
                    </TableCell>

                    {/* PACKING ASSIGNED (Blue) */}
                    <TableCell align="center">
                      <Box sx={{ 
                        display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, 
                        bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', fontWeight: 600
                      }}>
                        {row.packingAssigned}
                      </Box>
                    </TableCell>

                    {/* PACKING COMPLETED (Green) */}
                    <TableCell align="center">
                      <Box sx={{ 
                        display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, 
                        bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 600
                      }}>
                        {row.packingCompleted}
                      </Box>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}