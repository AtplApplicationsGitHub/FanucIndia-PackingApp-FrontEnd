"use client";

import { useMemo, useState } from "react";
import {
  alpha,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
  Link as MuiLink,
  CircularProgress,
} from "@mui/material";
import CommonButton from "@/common/components/CommonButton";
import AuditTableDialog from "../shared/AuditTableDialog";
import type { AuditRow } from "../../types/audit";

type Props = {
  rows: AuditRow[];
  onBack: () => void;
  onRelease: () => void;
  releasing: boolean;
};

const operatorName = (label: string) => label.split(" (")[0];

export default function BomAssignPreview({
  rows,
  onBack,
  onRelease,
  releasing,
}: Props) {
  const theme = useTheme();

  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  // Location popup (materials + qty of the clicked location)
  const [binOpen, setBinOpen] = useState(false);
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  // One row per distinct location (storage bin) with its assigned operator.
  // The parser guarantees one operator per bin, so the first row of a bin is enough.
  const locations = useMemo(() => {
    const seen = new Map<string, { storage: string; operator?: string }>();
    for (const row of rows) {
      if (!seen.has(row.storage)) {
        seen.set(row.storage, { storage: row.storage, operator: row.operator });
      }
    }
    return [...seen.values()];
  }, [rows]);
  // Materials + qty of the clicked location (rows are already parsed in the FE)
  const binMaterials = useMemo(
    () =>
      rows
        .filter((r) => r.storage === selectedBin)
        .map((r) => [r.materialCode, r.quantity]),
    [rows, selectedBin],
  );
  const headSx = {
    fontWeight: 700,
    color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
    whiteSpace: "nowrap" as const,
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography fontWeight={700}>Audit preview</Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            size="small"
            label={`${locations.length} locations`}
            sx={{
              fontWeight: 600,
              bgcolor: alpha(theme.palette.primary.main, 0.3),
            }}
          />

          <CommonButton onClick={onBack} disabled={releasing}>
            BACK
          </CommonButton>

          <CommonButton onClick={onRelease} disabled={releasing}>
            {releasing ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "RELEASE AUDIT"
            )}
          </CommonButton>
        </Box>
      </Box>

      {/* DISTINCT LOCATIONS + OPERATOR */}
      <TableContainer>
        <Table
          sx={{
            tableLayout: "fixed",
            width: "100%",
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: alpha(theme.palette.primary.main, 0.25),
            },
            "& .MuiTableBody-root .MuiTableRow-root:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            },
            "& .MuiTableCell-root": {
              borderBottom: "none",
              py: 0.5,
              px: 1.5,
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        >
          <colgroup>
            <col style={{ width: "33.33%" }} />
            <col style={{ width: "33.33%" }} />
            <col style={{ width: "33.34%" }} />
          </colgroup>
          <TableHead
            sx={{
              bgcolor: theme.palette.mode === "dark" ? "#000000" : "#ffffff",
            }}
          >
            <TableRow sx={{ height: 50 }}>
              <TableCell sx={headSx}>S.NO</TableCell>
              <TableCell sx={headSx}>LOCATION</TableCell>
              <TableCell sx={headSx}>OPERATOR</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No records found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              locations
                .slice(page * perPage, page * perPage + perPage)
                .map((row, index) => (
                  <TableRow key={row.storage} hover>
                    <TableCell>{page * perPage + index + 1}</TableCell>

                    <TableCell>
                      <MuiLink
                        component="button"
                        variant="body2"
                        onClick={() => {
                          setSelectedBin(row.storage);
                          setBinOpen(true);
                        }}
                        sx={{ fontWeight: 600, cursor: "pointer" }}
                      >
                        {row.storage}
                      </MuiLink>
                    </TableCell>
                    <TableCell>
                      {row.operator ? operatorName(row.operator) : "—"}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <TablePagination
        component="div"
        count={locations.length}
        page={page}
        rowsPerPage={perPage}
        rowsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(e) => {
          setPerPage(Number(e.target.value));
          setPage(0);
        }}
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      />
      <AuditTableDialog
        open={binOpen}
        title={`${selectedBin ?? ""} - MATERIALS`}
        columns={[{ label: "Material" }, { label: "Qty", align: "right" }]}
        rows={binMaterials}
        emptyText="No materials found."
        onClose={() => setBinOpen(false)}
      />
    </Paper>
  );
}
