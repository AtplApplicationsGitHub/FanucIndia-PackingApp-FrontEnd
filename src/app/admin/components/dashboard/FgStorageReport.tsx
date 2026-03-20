"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Typography,
    alpha,
    useTheme,
    Link as MuiLink
} from "@mui/material";
import Link from "next/link";
import { useFgStorageReport } from "@/app/admin/components/hooks/useFgStorageReport";
import { format } from "date-fns";
import { useEffect } from "react";

function formatDate(iso: string) {
    try {
        return format(new Date(iso), "dd-MMM-yyyy HH:mm");
    } catch {
        return iso;
    }
}



export default function FgStorageReportPanel() {
    const theme = useTheme();
    const lightYellow = alpha(theme.palette.primary.main, 0.25);

    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    useEffect(() => {
        setPage(0);
    }, [search]);

    const { rows, totalCount, loading, error } = useFgStorageReport(page, rowsPerPage, search);


    return (
        <Box sx={{ width: "100%", minWidth: 0, pt: 1, pb: 4, px: { xs: 2, md: 4 } }}>
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    bgcolor: "background.paper",
                }}
            >
                {error && (
                    <Typography color="error" variant="body2" sx={{ px: 3, pt: 1 }}>
                        {error}
                    </Typography>
                )}
                <TableContainer>
                    <Table
                        sx={{
                            minWidth: 650,
                            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                                backgroundColor: lightYellow,
                            },
                            "& .MuiTableBody-root .MuiTableRow-root:hover": {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            },
                            "& .MuiTableCell-root": {
                                borderBottom: "none",
                                py: 1.5,
                                px: 2,
                                fontSize: "0.875rem",
                                whiteSpace: "nowrap",
                            },
                        }}
                    >
                        <TableHead
                            sx={{
                                bgcolor: (t) =>
                                    t.palette.mode === "dark" ? "#000000" : "#ffffff",
                            }}
                        >
                            <TableRow sx={{ height: 60 }}>
                                {[
                                    "LOCATION",
                                    "SALE ORDER NUMBER",
                                    "OUT BOUND DELIVERY",
                                    "LAST UPDATED BY",
                                    "DATE & TIME",
                                ].map((head) => (
                                    <TableCell
                                        key={head}
                                        sx={{
                                            color: (t) =>
                                                t.palette.mode === "dark" ? "#ffffff" : "#000000",
                                            fontWeight: 700,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {head}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? null : rows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        align="center"
                                        sx={{ py: 4, bgcolor: lightYellow }}
                                    >
                                        No records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row, idx) => (
                                    <TableRow key={idx}>

                                        {/* LOCATION */}
                                        <TableCell>
                                            {row.fgLocation && row.fgLocation !== "N/A"
                                                ? row.fgLocation
                                                : "N/A"
                                            }
                                        </TableCell>

                                        {/* SO NUMBER */}
                                        <TableCell>
                                            <MuiLink
                                                component={Link}
                                                href={`/so-search/${row.saleOrderNumber}${row.outboundDelivery ? '/' + row.outboundDelivery : ''}`}
                                                underline="hover"
                                                sx={{ fontWeight: 500 }}
                                            >
                                                {row.saleOrderNumber}
                                            </MuiLink>
                                        </TableCell>

                                        {/* OBD */}
                                        <TableCell>{row.outboundDelivery}</TableCell>

                                        {/* LAST UPDATED BY */}
                                        <TableCell>{row.LastUpdatedBy}</TableCell>

                                        {/* DATE & TIME */}
                                        <TableCell sx={{ color: "text.secondary" }}>
                                            {formatDate(row.dateTime)}
                                        </TableCell>

                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* PAGINATION */}
            </Paper>

            <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[10, 20, 50, 100]}
                sx={{
                    bgcolor: "transparent",
                }}
            />
        </Box>
    );
}