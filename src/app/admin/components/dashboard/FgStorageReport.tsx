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
    TextField,
    InputAdornment,
    IconButton,
    Link as MuiLink
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Link from "next/link";
import { useFgStorageReport } from "@/app/admin/components/hooks/useFgStorageReport";
import { format } from "date-fns";
import { useEffect } from "react";

function formatDate(iso: string) {
    if (!iso || iso === "-") return "-"; 
    try {
        return format(new Date(iso), "dd-MMM-yyyy HH:mm");
    } catch {
        return iso;
    }
}

export default function FgStorageReportPanel() {
    const theme = useTheme();
    const lightYellow = alpha(theme.palette.primary.main, 0.25);

    const [searchInput, setSearchInput] = React.useState("");
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    useEffect(() => {
        setPage(0);
    }, [search]);

    const { rows, totalCount, loading, error } = useFgStorageReport(page, rowsPerPage, search);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSearch(searchInput);
        }
    };

    // --- ADDED CLEAR FUNCTION ---
    const handleClearSearch = () => {
        setSearchInput("");
        setSearch("");
    };

    return (
        <Box sx={{ width: "100%", minWidth: 0, pt: 1, pb: 4, px: { xs: 2, md: 4 } }}>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Search"
                    value={searchInput}
                    
                    onChange={(e) => {
                        const val = e.target.value;
                        setSearchInput(val);
                        if (val === "") {
                            setSearch("");
                        }
                    }}

                    onKeyDown={handleSearchKeyDown}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: searchInput ? (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="clear search"
                                    onClick={handleClearSearch}
                                    edge="end"
                                    size="small"
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                    sx={{ 
                        width: { xs: '100%', sm: '400px' }, 
                        bgcolor: 'background.paper', 
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                        }
                    }}
                />
            </Box>

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
                                    "DURATION" 
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
                                        colSpan={6}
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
                                                : "-"
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
                                        <TableCell>{row.outboundDelivery || "-"}</TableCell>

                                        {/* LAST UPDATED BY */}
                                        <TableCell>{row.LastUpdatedBy}</TableCell>

                                        {/* DATE & TIME */}
                                        <TableCell sx={{ color: "text.secondary" }}>
                                            {formatDate(row.dateTime)}
                                        </TableCell>

                                        {/* DURATION */}
                                        <TableCell sx={{ 
                                            fontWeight: 600, 
                                            color: (t) => t.palette.mode === 'dark' ? '#60a5fa' : '#2563eb' 
                                        }}>
                                            {row.durationText}
                                        </TableCell>

                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
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