"use client";

import * as React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import {
    Box,
    Tab,
    Tabs,
    Button,
    InputBase,
    IconButton,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    alpha,
    useTheme,
    CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import BarChartIcon from "@mui/icons-material/BarChart";
import TableRowsIcon from "@mui/icons-material/TableRows";
import { useCustomerSOCount, useCustomerSOByMaterial } from "@/app/admin/components/hooks/useCustomerReport";
import ClearIcon from "@mui/icons-material/Clear";

// Shared chart colors 
const COLORS = {
    tab1Bar: "#FF6B6B",
    tab2Bar: "#3B82F6",
    primary: "#D00000",
    yellow: "#FFC107",
};

// Chart - Table toggle button
function ViewToggleButton({
    viewMode,
    onToggle,
}: {
    viewMode: "chart" | "table";
    onToggle: () => void;
}) {
    return (
        <Button
            onClick={onToggle}
            variant="outlined"
            size="small"
            startIcon={viewMode === "chart" ? <TableRowsIcon /> : <BarChartIcon />}
            sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                borderColor: "divider",
                color: "text.primary",
                "&:hover": { borderColor: "text.secondary" },
            }}
        >
            {viewMode === "chart" ? "Table View" : "Chart View"}
        </Button>
    );
}

function SOBarChartAndTable({
    rows,
    barColor,
    barLabel,
    emptyMessage,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    yAxisLabel = "SO Count",
}: {
    rows: { customerName: string; soCount: number }[];
    barColor: string;
    barLabel: string;
    emptyMessage: string;
    page: number;
    setPage: (p: number) => void;
    rowsPerPage: number;
    setRowsPerPage: (r: number) => void;
    yAxisLabel?: string;
}) {
    const theme = useTheme();
    const lightYellow = alpha(theme.palette.primary.main, 0.25);
    const [viewMode, setViewMode] = React.useState<"chart" | "table">("chart");

    const paginated = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (rows.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
                {emptyMessage}
            </Typography>
        );
    }

    return (
        <Box>
            {/* Toggle */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <ViewToggleButton
                    viewMode={viewMode}
                    onToggle={() => setViewMode(v => v === "chart" ? "table" : "chart")}
                />
            </Box>

            {viewMode === "chart" ? (
                /* ── Bar Chart ── */
                <Box sx={{ height: 420, mx: -3, mb: -3 }}>
                    <BarChart
                        aria-label={barLabel}
                        dataset={rows}
                        height={400}
                        margin={{ top: 20, right: 40, left: 60, bottom: 90 }}
                        xAxis={[{
                            dataKey: "customerName",
                            scaleType: "band",
                            label: "Customer Name",
                            tickLabelStyle: { angle: -30, textAnchor: "end", fontSize: 11 },
                        }]}
                        yAxis={[{ scaleType: "linear", tickMinStep: 1, label: yAxisLabel }]}
                        series={[{
                            dataKey: "soCount",
                            label: barLabel,
                            color: barColor,
                            valueFormatter: (v: number | null) => (v ?? 0).toString(),
                        }]}
                        slotProps={{
                            legend: {
                                position: { vertical: "bottom", horizontal: "center" },
                                sx: {
                                    "& .MuiChartsLegend-label": { fontSize: 12, fontWeight: 600 },
                                },
                            },
                        }}
                        sx={{
                            "& .MuiChartsAxis-tickLabel": { fill: theme.palette.text.primary },
                            "& .MuiChartsAxis-line": { stroke: theme.palette.text.primary },
                            "& .MuiChartsAxis-tick": { stroke: theme.palette.text.primary },
                            "& .MuiChartsLegend-label": { fill: theme.palette.text.primary },
                        }}
                    />
                </Box>
            ) : (
                <>
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
                        <TableContainer>
                            <Table
                                sx={{
                                    minWidth: 400,
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
                                        {["CUSTOMER NAME", "SO COUNT"].map((head) => (
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
                                    {paginated.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={2}
                                                align="center"
                                                sx={{ py: 4, bgcolor: lightYellow }}
                                            >
                                                No records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginated.map((row, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{row.customerName}</TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: barColor }}>
                                                    {row.soCount}
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
                        count={rows.length}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        sx={{ bgcolor: "transparent" }}
                    />
                </>
            )}
        </Box>
    );
}

// TAB 1
function CustomerSOCountTab() {
    const [fromDate, setFromDate] = React.useState<Dayjs | null>(dayjs());
    const [toDate, setToDate] = React.useState<Dayjs | null>(dayjs());
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const fromIso = fromDate?.format("YYYY-MM-DD") ?? null;
    const toIso = toDate?.format("YYYY-MM-DD") ?? null;

    const { rows, loading, error } = useCustomerSOCount(fromIso, toIso);

    return (
        <Box>
            {/* Date range filter */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 2, mb: 3 }}>
                    <DatePicker
                        label="From"
                        value={fromDate}
                        format="DD-MM-YYYY"
                        onChange={(val) => { setFromDate(val); setPage(0); }}
                        maxDate={toDate ?? undefined}
                        slotProps={{
                            textField: {
                                size: "small",
                                sx: { width: 160, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } },
                            },
                        }}
                    />

                    <DatePicker
                        label="To"
                        value={toDate}
                        format="DD-MM-YYYY"
                        onChange={(val) => { setToDate(val); setPage(0); }}
                        minDate={fromDate ?? undefined}
                        slotProps={{
                            textField: {
                                size: "small",
                                sx: { width: 160, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } },
                            },
                        }}
                    />

                    {fromDate && toDate && (
                        <Typography variant="caption" color="text.disabled">
                            {toDate.diff(fromDate, "day") + 1} day(s) selected
                        </Typography>
                    )}
                </Box>
            </LocalizationProvider>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress size={28} />
                </Box>
            )}
            {!loading && error && (
                <Typography color="error" variant="body2" sx={{ py: 4, textAlign: "center" }}>
                    {error}
                </Typography>
            )}
            {!loading && !error && (
                <SOBarChartAndTable
                    rows={rows}
                    barColor={COLORS.tab1Bar}
                    barLabel="SO Count"
                    emptyMessage="No data for the selected date range."
                    page={page}
                    setPage={setPage}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                />
            )}
        </Box>
    );
}

function getButtonSx(theme: any) {
    return {
        borderRadius: 0,
        clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
        fontWeight: 600,
        fontSize: 15,
        minWidth: 120,
        height: 40,
        px: 3,
        textTransform: "none" as const,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease-in-out",
        bgcolor: theme.palette.action.hover,
        color: theme.palette.text.primary,
        "&:hover": {
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
        },
    };
}


// TAB 2 
function MaterialSOCountTab() {
    const theme = useTheme();
    const [inputValue, setInputValue] = React.useState("");
    const [committedCode, setCommittedCode] = React.useState<string | null>(null);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const { rows, loading, error, notFound, fetch: fetchByMaterial } = useCustomerSOByMaterial();

    const handleSearch = () => {
        const code = inputValue.trim().toUpperCase();
        if (!code) return;
        setCommittedCode(code);
        setPage(0);
        fetchByMaterial(code);
    };

    return (
        <Box>
            {/* Search bar */}
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 2, mb: 3 }}>
                <Paper
                    component="form"
                    onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                    sx={{
                        p: "2px 4px",
                        display: "flex",
                        alignItems: "center",
                        width: 260,
                        border: 1,
                        borderColor: (t) =>
                            t.palette.mode === "dark"
                                ? "rgba(255,255,255,0.23)"
                                : "#e0e0e0",
                        borderRadius: "4px",
                        height: 40,
                        bgcolor: "background.paper",
                        boxShadow: "none",
                    }}
                >
                    <InputBase
                        sx={{ ml: 1, flex: 1, fontSize: "13px" }}
                        placeholder="e.g. MAT-001-K22"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        inputProps={{ "aria-label": "material code search" }}
                    />
                    {inputValue && (
                        <IconButton
                            sx={{ p: "5px" }}
                            onClick={() => {
                                setInputValue("");
                                setCommittedCode(null);
                            }}
                        >
                            <ClearIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    )}
                    <IconButton type="submit" sx={{ p: "5px" }} disabled={!inputValue.trim()}>
                        <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </IconButton>
                </Paper>
                <Button
                    onClick={handleSearch}
                    disabled={!inputValue.trim()}
                    sx={getButtonSx(theme)}
                >
                    Search
                </Button>
            </Box>

            {/* States */}
            {!committedCode && (
                <Typography variant="body2" color="text.disabled" sx={{ py: 8, textAlign: "center" }}>
                    Enter a Material Code above to view customer SO count distribution.
                </Typography>
            )}
            {committedCode && loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress size={28} />
                </Box>
            )}
            {committedCode && !loading && error && (
                <Typography color="error" variant="body2" sx={{ py: 4, textAlign: "center" }}>
                    {error}
                </Typography>
            )}
            {committedCode && !loading && !error && notFound && (
                <Typography variant="body2" color="error" sx={{ py: 8, textAlign: "center" }}>
                    No data found for material code{" "}
                    <Box component="span" sx={{ fontWeight: 700 }}>{committedCode}</Box>.
                </Typography>
            )}
            {committedCode && !loading && !error && !notFound && rows.length > 0 && (
                <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Showing SO count per customer for material code{" "}
                        <Box component="span" sx={{ fontWeight: 700, color: COLORS.primary }}>
                            {committedCode}
                        </Box>
                    </Typography>
                    <SOBarChartAndTable
                        rows={rows}
                        barColor={COLORS.tab2Bar}
                        barLabel={`SO Count — ${committedCode}`}
                        emptyMessage="No customers found."
                        page={page}
                        setPage={setPage}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        yAxisLabel="Total Quantity"
                    />
                </>
            )}
        </Box>
    );
}


export default function CustomerReport() {
    const [activeTab, setActiveTab] = React.useState(0);
    const theme = useTheme();

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>

            {/* Yellow tab bar */}
            <Paper
                elevation={2}
                sx={{
                    mb: 0,
                    width: "fit-content",
                    mx: "auto",
                    borderRadius: 1,
                    bgcolor: theme.palette.primary.main,
                    overflow: "hidden",
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(_e, val) => setActiveTab(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    textColor="inherit"
                    sx={{
                        minHeight: 48,
                        px: 2,
                        "& .MuiTab-root": {
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#000",
                            opacity: 0.6,
                            minHeight: 48,
                            px: 5,
                            textTransform: "uppercase",
                            "&.Mui-selected": {
                                opacity: 1,
                            },
                        },
                        "& .MuiTabs-indicator": {
                            bgcolor: "#000",
                            height: 3,
                        },
                    }}
                >
                    <Tab label="SO's per Customer" />
                    <Tab label="Material Required per Customer" />
                </Tabs>
            </Paper>

            {/* ── Content — same padding as FgStorageReportPanel ── */}
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
                        p: 3,
                    }}
                >
                    {activeTab === 0 && <CustomerSOCountTab />}
                    {activeTab === 1 && <MaterialSOCountTab />}
                </Paper>
            </Box>
        </Box>
    );
}