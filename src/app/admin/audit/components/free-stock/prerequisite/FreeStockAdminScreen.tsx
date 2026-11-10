"use client";
import { useEffect, useState } from "react";
import { Alert, Box, Chip, IconButton, InputAdornment, ListItemIcon, ListItemText, Menu as MuiMenu, MenuItem, Paper, Snackbar, Stack, Switch, TextField, Tooltip } from "@mui/material";
import { Archive, Boxes, Download, FileSpreadsheet, History, LockKeyhole, Menu, PackageOpen, RefreshCw, Search, Unlock, Upload, X } from "lucide-react";
import type { FreeStockRole, FreeStockRow, FreeStockStatus } from "../../../types/freeStock";
import { downloadReservationTemplate, exportStock } from "../../../utils/free-stock/freeStockExport";
import { useFreeStock } from "../../../hooks/free-stock/useFreeStock";
import FreeStockTable from "./FreeStockTable";
import FreeStockFilterCard from "./FreeStockFilterCard";
import FreeStockDetailDialog from "./FreeStockDetailDialog";
import FreeStockUploadDialog from "./FreeStockUploadDialog";
import FreeStockReserveDialog from "./FreeStockReserveDialog";
import FreeStockReleaseDialog from "./FreeStockReleaseDialog";
import FreeStockUploadHistory from "./FreeStockUploadHistory";
import FreeStockError from "./FreeStockError";

export default function FreeStockAdminScreen({ role = "ADMIN" }: { role?: FreeStockRole }) {
  const stock = useFreeStock();
  const { data, filters, refresh, counts } = stock;
  const [selected, setSelected] = useState<number[]>([]);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [upload, setUpload] = useState<"stock" | "reservation" | null>(null);
  const [reserveRows, setReserveRows] = useState<FreeStockRow[] | null>(null);
  const [releaseRows, setReleaseRows] = useState<FreeStockRow[] | null>(null);
  const [history, setHistory] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState<{ severity: "success" | "error"; message: string } | null>(null);
  const [actionError, setActionError] = useState<Error | null>(null);
  const admin = role === "ADMIN";
  const rows = data?.data ?? [];
  const selectedRows = rows.filter((row) => selected.includes(row.id));
  const pending = stock.loading || stock.search !== filters.search;
  const cards = [
    { key: "ALL" as const, title: "All Stock", count: counts.OPEN + counts.RESERVED + counts.CLOSED, icon: <Boxes size={18} /> },
    { key: "OPEN" as FreeStockStatus, title: "Open", count: counts.OPEN, icon: <PackageOpen size={18} /> },
    { key: "RESERVED" as FreeStockStatus, title: "Reserved", count: counts.RESERVED, icon: <LockKeyhole size={18} /> },
    { key: "CLOSED" as FreeStockStatus, title: "Closed", count: counts.CLOSED, icon: <Archive size={18} /> },
  ];
  useEffect(() => { setSelected([]); }, [filters, data]);
  const success = (message: string) => {
    setUpload(null); setReserveRows(null); setReleaseRows(null); setSelected([]); setActionError(null);
    setNotice({ message, severity: "success" }); refresh();
  };
  const download = async (template: boolean) => {
    if (downloading) return;
    setDownloading(true); setActionError(null);
    try { if (template) await downloadReservationTemplate(); else await exportStock(filters); }
    catch (reason) { setActionError(reason instanceof Error ? reason : new Error("Download failed.")); }
    finally { setDownloading(false); }
  };
  const release = (row: FreeStockRow) => { setDetailId(null); setReleaseRows([row]); };
  const menuAction = (action: () => void) => { setMenuAnchor(null); action(); };
  return <Box sx={{ px: { xs: 1, md: 2.5 }, py: 2, width: "100%", minWidth: 0 }}>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: 1.5, mb: 2 }}>
      {cards.map((card) => <FreeStockFilterCard key={card.key} title={card.title} count={card.count} icon={card.icon} selected={stock.status === card.key} onSelect={() => stock.changeStatus(card.key)} />)}
    </Box>
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", minWidth: 0 }}>
      <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap gap={0.75} sx={{ px: 1.5, py: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, maxWidth: "100%", minWidth: 0 }}>
          <TextField size="small" placeholder="Search" value={stock.search} onChange={(event) => stock.setSearch(event.target.value)} inputProps={{ "aria-label": "Search free stock", maxLength: 255 }} sx={{ width: { xs: 190, sm: 270 }, minWidth: 0, flexShrink: 1 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search size={17} /></InputAdornment>, endAdornment: (stock.search || stock.status !== "ALL" || stock.mine || stock.page > 0) ? <InputAdornment position="end"><Tooltip title="Clear filters"><IconButton aria-label="Clear filters" size="small" edge="end" onClick={stock.clear}><X size={18} /></IconButton></Tooltip></InputAdornment> : undefined }} />
          <Tooltip title="Refresh stock"><span><IconButton aria-label="Refresh stock" size="small" disabled={stock.loading} onClick={refresh}><RefreshCw size={22} /></IconButton></span></Tooltip>
        </Box>
        {!admin && <Tooltip title="My Reservations"><Box component="span" sx={{ display: "inline-flex" }}><Switch size="small" slotProps={{ input: { role: "switch", "aria-label": "My Reservations" } }} checked={stock.mine} onChange={(_, value) => stock.changeMine(value)} /></Box></Tooltip>}
        <Box sx={{ flexGrow: 1 }} />
        {selected.length > 0 && <Chip size="small" label={`${selected.length} selected`} onDelete={() => setSelected([])} />}
        <Tooltip title="Actions"><IconButton aria-label="Free Stock actions" aria-controls={menuAnchor ? "free-stock-actions" : undefined} aria-expanded={Boolean(menuAnchor)} aria-haspopup="menu" size="small" onClick={(event) => setMenuAnchor(event.currentTarget)}><Menu size={20} /></IconButton></Tooltip>
      </Stack>
      <MuiMenu id="free-stock-actions" anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem disabled={pending || downloading || !data} onClick={() => menuAction(() => { void download(false); })}><ListItemIcon><Download size={17} /></ListItemIcon><ListItemText>{downloading ? "Downloading…" : "Export Excel"}</ListItemText></MenuItem>
        {admin ? [
          <MenuItem key="history" onClick={() => menuAction(() => setHistory(true))}><ListItemIcon><History size={17} /></ListItemIcon><ListItemText>Upload History</ListItemText></MenuItem>,
          <MenuItem key="upload" onClick={() => menuAction(() => setUpload("stock"))}><ListItemIcon><Upload size={17} /></ListItemIcon><ListItemText>Upload SAP Stock</ListItemText></MenuItem>,
        ] : [
          <MenuItem key="template" disabled={downloading} onClick={() => menuAction(() => { void download(true); })}><ListItemIcon><FileSpreadsheet size={17} /></ListItemIcon><ListItemText>Reservation Template</ListItemText></MenuItem>,
          <MenuItem key="upload" onClick={() => menuAction(() => setUpload("reservation"))}><ListItemIcon><Upload size={17} /></ListItemIcon><ListItemText>Reserve from Excel</ListItemText></MenuItem>,
          <MenuItem key="reserve" disabled={pending || !selectedRows.length || !selectedRows.every((row) => row.canReserve)} onClick={() => menuAction(() => setReserveRows(selectedRows))}><ListItemIcon><LockKeyhole size={17} /></ListItemIcon><ListItemText>Reserve Selected</ListItemText></MenuItem>,
        ]}
        <MenuItem disabled={pending || !selectedRows.length || !selectedRows.every((row) => row.canRelease)} onClick={() => menuAction(() => setReleaseRows(selectedRows))}><ListItemIcon><Unlock size={17} /></ListItemIcon><ListItemText>Release Selected</ListItemText></MenuItem>
      </MuiMenu>
      {(stock.error || actionError) && <Box sx={{ px: 1.5 }}><FreeStockError error={stock.error} /><FreeStockError error={actionError} /></Box>}
      <FreeStockTable rows={rows} total={data?.pagination.total ?? 0} page={stock.page} size={stock.size} loading={pending} selected={selected} onSelect={setSelected} onPage={stock.setPage} onSize={stock.changeSize} onView={setDetailId} onRelease={release} />
    </Paper>
    {detailId !== null && <FreeStockDetailDialog id={detailId} role={role} onClose={() => setDetailId(null)} onRelease={release} />}
    {upload && <FreeStockUploadDialog mode={upload} onClose={() => setUpload(null)} onSuccess={success} onChanged={refresh} />}
    {reserveRows && <FreeStockReserveDialog rows={reserveRows} onClose={() => setReserveRows(null)} onSuccess={success} onChanged={refresh} />}
    {releaseRows && <FreeStockReleaseDialog rows={releaseRows} onClose={() => setReleaseRows(null)} onSuccess={success} onChanged={refresh} />}
    {history && <FreeStockUploadHistory onClose={() => setHistory(false)} />}
    <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}><Alert severity={notice?.severity ?? "success"} onClose={() => setNotice(null)}>{notice?.message}</Alert></Snackbar>
  </Box>;
}
