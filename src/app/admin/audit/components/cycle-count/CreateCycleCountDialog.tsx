"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";

import CommonButton from "@/common/components/CommonButton";
import ExcelUpload from "../planning/ExcelUpload";
import CycleCountPlanTable from "./CycleCountPlanTable";

import {
  CYCLE_COUNT_UPDATED_EVENT,
  createCycleCount,
  loadCycleCountOperators,
  previewCycleCountPlan,
  showGlobalMessage,
  uploadCycleCountStock,
} from "../../utils/cycleCountApi";
import {
  CNC_FILTER_LABELS,
  SELECTION_METHOD_LABELS,
  localYmd,
} from "../../utils/cycleCountLabels";
import type {
  CncFilter,
  CycleCountOperator,
  MaterialClass,
  PlanCriteria,
  PlanPreview,
  SelectionMethod,
  StockUpload,
} from "../../types/cycleCount";

type Props = {
  open: boolean;
  onClose: () => void;
};

const CLASSES: MaterialClass[] = ["A", "B", "C"];
const MAX_LOCATIONS = 500;
const DEFAULT_RANGE_DAYS = 30;

/** Small numbered section box (same look as the BOM create dialog steps). */
function Step({ no, title, hint, children }: { no: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box>
        <Typography variant="body2" fontWeight={700}>
          {no}. {title}
        </Typography>
        {hint && (
          <Typography variant="body2" color="text.secondary">
            {hint}
          </Typography>
        )}
      </Box>
      {children}
    </Paper>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, px: 1.5, py: 0.75, minWidth: 120 }}>
      <Typography fontWeight={700} fontSize={18}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

/*
 * Cycle Count - Create audit (Phase A on the web):
 *   1 Upload SAP LX03 stock (validated on the server, zero-stock / invalid rows excluded)
 *   2 Movement period: date range + "Include archived DIMS data"
 *   3 Plan: busiest / random / manual, number of locations, CNC, A/B/C -> Generate plan (preview)
 *   4 Audit name + operators -> Release (one audit per operator)
 */
export default function CreateCycleCountDialog({ open, onClose }: Props) {
  // 1 - stock
  const [file, setFile] = useState<File | null>(null);
  const [upload, setUpload] = useState<StockUpload | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showExcluded, setShowExcluded] = useState(false);
  // 2 - movement period
  const [fromDate, setFromDate] = useState(() => localYmd(DEFAULT_RANGE_DAYS));
  const [toDate, setToDate] = useState(() => localYmd(0));
  const [includeArchived, setIncludeArchived] = useState(true);
  // 3 - plan
  const [method, setMethod] = useState<SelectionMethod>("BUSIEST");
  const [count, setCount] = useState(20);
  const [cnc, setCnc] = useState<CncFilter>("BOTH");
  const [classes, setClasses] = useState<MaterialClass[]>([...CLASSES]);
  const [preview, setPreview] = useState<PlanPreview | null>(null);
  const [manualSel, setManualSel] = useState<Set<string>>(new Set());
  const [previewing, setPreviewing] = useState(false);
  // 4 - assign
  const [auditName, setAuditName] = useState("");
  const [operators, setOperators] = useState<CycleCountOperator[]>([]);
  const [selectedOps, setSelectedOps] = useState<CycleCountOperator[]>([]);
  const [releasing, setReleasing] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    loadCycleCountOperators()
      .then(setOperators)
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load operators."));
  }, [open]);

  const reset = () => {
    setFile(null);
    setUpload(null);
    setShowExcluded(false);
    setFromDate(localYmd(DEFAULT_RANGE_DAYS));
    setToDate(localYmd(0));
    setIncludeArchived(true);
    setMethod("BUSIEST");
    setCount(20);
    setCnc("BOTH");
    setClasses([...CLASSES]);
    setPreview(null);
    setManualSel(new Set());
    setAuditName("");
    setSelectedOps([]);
    setError("");
  };

  const handleClose = () => {
    if (releasing) return;
    reset();
    onClose();
  };

  /** Any change of the criteria makes the shown plan outdated. */
  const invalidatePlan = () => {
    setPreview(null);
    setManualSel(new Set());
  };

  const criteria = (): PlanCriteria | null =>
    upload
      ? {
          stockUploadId: upload.id,
          fromDate,
          toDate,
          includeArchived,
          selectionMethod: method,
          cncFilter: cnc,
          materialClasses: classes,
        }
      : null;

  // ---------------------------------------------------------------- 1 upload

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose the LX03 stock file.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const result = await uploadCycleCountStock(file);
      setUpload(result);
      invalidatePlan();
      if (!result.hasCncColumn) setCnc("BOTH");
      if (!result.hasClassColumn) setClasses([...CLASSES]);
    } catch (e) {
      setUpload(null);
      setError(e instanceof Error ? e.message : "Failed to upload the stock file.");
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------------------------------------------- 3 generate plan

  const rangeError = fromDate && toDate && fromDate > toDate ? "From date must be on or before To date." : "";

  const handleGenerate = async () => {
    const c = criteria();
    if (!c) return;
    if (rangeError) {
      setError(rangeError);
      return;
    }
    if (!classes.length) {
      setError("Select at least one material class.");
      return;
    }
    setError("");
    setPreviewing(true);
    try {
      const result = await previewCycleCountPlan(
        method === "MANUAL" ? { ...c, storageBins: [] } : { ...c, locationCount: count },
      );
      setPreview(result);
      setManualSel(new Set());
    } catch (e) {
      setPreview(null);
      setError(e instanceof Error ? e.message : "Failed to generate the plan.");
    } finally {
      setPreviewing(false);
    }
  };

  /** Bins that will be released: the server plan, or the ticked candidates (MANUAL). */
  const planRows = useMemo(() => {
    if (!preview) return [];
    if (method === "MANUAL") return (preview.candidates ?? []).filter((r) => manualSel.has(r.storageBin));
    return preview.plan;
  }, [preview, method, manualSel]);

  // ---------------------------------------------------------------- 4 release

  const shareInfo = useMemo(() => {
    if (!planRows.length || !selectedOps.length) return "";
    const n = Math.min(selectedOps.length, planRows.length);
    const size = Math.ceil(planRows.length / n);
    return `${planRows.length} location${planRows.length === 1 ? "" : "s"} shared between ${n} operator${n === 1 ? "" : "s"} (about ${size} each) → ${n} audit${n === 1 ? "" : "s"} will be created.`;
  }, [planRows, selectedOps]);

  const handleRelease = async () => {
    const c = criteria();
    if (!c || !planRows.length) return;
    if (!auditName.trim()) {
      setError("Please enter the Audit Name.");
      return;
    }
    if (!selectedOps.length) {
      setError("Please select at least one operator.");
      return;
    }
    if (selectedOps.length > planRows.length) {
      setError(`The plan has ${planRows.length} location(s). Select at most ${planRows.length} operator(s).`);
      return;
    }
    setError("");
    setReleasing(true);
    try {
      const result = await createCycleCount({
        ...c,
        auditName: auditName.trim(),
        storageBins: planRows.map((r) => r.storageBin),
        operatorIds: selectedOps.map((o) => o.id),
      });
      showGlobalMessage(result.message, "success");
      window.dispatchEvent(new Event(CYCLE_COUNT_UPDATED_EVENT));
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to release the Cycle Count audit.");
    } finally {
      setReleasing(false);
    }
  };

  const busy = uploading || previewing || releasing;

  return (
    <Dialog
      open={open}
      onClose={releasing ? undefined : handleClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 700,
          fontSize: "20px",
          letterSpacing: 0.5,
          color: "error.main",
          pb: 1,
          position: "relative",
        }}
      >
        CYCLE COUNT – CREATE AUDIT
        <IconButton onClick={handleClose} disabled={releasing} size="small" sx={{ position: "absolute", right: 12 }}>
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2.5 }}>
        {/* ---------------- 1. Stock data ---------------- */}
        <Step no="1" title="Upload SAP stock (LX03)" hint="Required columns: StorageBin, Material, Avail. Rows with zero stock or invalid data are left out of the plan.">
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 1.5, alignItems: { md: "center" } }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ExcelUpload
                file={file}
                onChange={(f) => {
                  setFile(f);
                  setUpload(null);
                  invalidatePlan();
                }}
              />
            </Box>
            <CommonButton onClick={handleUpload} disabled={!file || busy || Boolean(upload)}>
              {uploading ? <CircularProgress size={22} color="inherit" /> : upload ? "UPLOADED" : "UPLOAD & VALIDATE"}
            </CommonButton>
          </Box>

          {upload && (
            <>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Stat label="Rows in file" value={upload.totalRows} />
                <Stat label="Valid rows" value={upload.validRows} />
                <Stat label="Excluded rows" value={upload.excludedRows} />
                <Stat label="Locations" value={upload.totalLocations} />
                <Stat label="Packages (Cert. No.)" value={upload.hasCertNoColumn ? upload.totalPackages : "–"} />
              </Box>
              {upload.excludedByReason.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
                  {upload.excludedByReason.map((r) => (
                    <Chip key={r.reason} size="small" color="error" variant="outlined" label={`${r.label}: ${r.count}`} />
                  ))}
                  <CommonButton size="small" onClick={() => setShowExcluded((v) => !v)} sx={{ height: 28 }}>
                    {showExcluded ? "Hide excluded rows" : "View excluded rows"}
                  </CommonButton>
                </Box>
              )}
              <Collapse in={showExcluded} unmountOnExit>
                <Box sx={{ maxHeight: 260, overflow: "auto", border: 1, borderColor: "divider", borderRadius: 1 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Excel Row</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Storage Bin</TableCell>
                        <TableCell>Material</TableCell>
                        <TableCell align="right">Avail</TableCell>
                        <TableCell>Cert. No.</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upload.excludedSample.map((r) => (
                        <TableRow key={r.rowNo}>
                          <TableCell>{r.rowNo}</TableCell>
                          <TableCell>{r.reasonLabel}</TableCell>
                          <TableCell>{r.storageBin || "–"}</TableCell>
                          <TableCell>{r.materialCode || "–"}</TableCell>
                          <TableCell align="right">{r.qty ?? "–"}</TableCell>
                          <TableCell>{r.certNo ?? "–"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
                {upload.excludedSample.length < upload.excludedRows && (
                  <Typography variant="caption" color="text.secondary">
                    Showing the first {upload.excludedSample.length} of {upload.excludedRows} excluded rows.
                  </Typography>
                )}
              </Collapse>
              {(!upload.hasCncColumn || !upload.hasClassColumn || !upload.hasCertNoColumn) && (
                <Alert severity="info">
                  {[
                    !upload.hasCertNoColumn && "no Cert. No. column (packages cannot be counted)",
                    !upload.hasCncColumn && "no CNC column (CNC filter not available)",
                    !upload.hasClassColumn && "no material class column (A / B / C filter not available)",
                  ]
                    .filter(Boolean)
                    .join("; ")
                    .replace(/^./, (s) => `This file has ${s}`)}
                  .
                </Alert>
              )}
            </>
          )}
        </Step>

        {upload && (
          <>
            {/* ---------------- 2. Movement period ---------------- */}
            <Step
              no="2"
              title="Movement period"
              hint="DIMS transfer orders in this period decide which locations are busy. Archived orders can be included."
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                <TextField
                  label="From"
                  type="date"
                  size="small"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    invalidatePlan();
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: toDate || undefined }}
                  error={Boolean(rangeError)}
                />
                <TextField
                  label="To"
                  type="date"
                  size="small"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    invalidatePlan();
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: fromDate || undefined }}
                  error={Boolean(rangeError)}
                  helperText={rangeError || undefined}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeArchived}
                      onChange={(e) => {
                        setIncludeArchived(e.target.checked);
                        invalidatePlan();
                      }}
                    />
                  }
                  label="Include archived DIMS data"
                />
              </Box>
            </Step>

            {/* ---------------- 3. Plan ---------------- */}
            <Step no="3" title="Plan the count" hint="Choose how many locations and how to pick them, then generate the plan.">
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, alignItems: "flex-end" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    How to pick locations
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={method}
                    onChange={(_, v: SelectionMethod | null) => {
                      if (!v) return;
                      setMethod(v);
                      invalidatePlan();
                    }}
                  >
                    {(Object.keys(SELECTION_METHOD_LABELS) as SelectionMethod[]).map((m) => (
                      <ToggleButton key={m} value={m} sx={{ textTransform: "none", px: 1.5 }}>
                        {SELECTION_METHOD_LABELS[m]}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>

                {method !== "MANUAL" && (
                  <TextField
                    label="Number of locations"
                    type="number"
                    size="small"
                    value={count}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      setCount(Number.isFinite(n) ? Math.min(MAX_LOCATIONS, Math.max(1, n)) : 1);
                      invalidatePlan();
                    }}
                    inputProps={{ min: 1, max: MAX_LOCATIONS }}
                    sx={{ width: 170 }}
                  />
                )}

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    CNC packages
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={cnc}
                    disabled={!upload.hasCncColumn}
                    onChange={(_, v: CncFilter | null) => {
                      if (!v) return;
                      setCnc(v);
                      invalidatePlan();
                    }}
                  >
                    {(Object.keys(CNC_FILTER_LABELS) as CncFilter[]).map((v) => (
                      <ToggleButton key={v} value={v} sx={{ textTransform: "none", px: 1.5 }}>
                        {CNC_FILTER_LABELS[v]}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Material class
                  </Typography>
                  {CLASSES.map((c) => (
                    <FormControlLabel
                      key={c}
                      disabled={!upload.hasClassColumn}
                      control={
                        <Checkbox
                          size="small"
                          checked={classes.includes(c)}
                          onChange={(e) => {
                            setClasses((prev) => (e.target.checked ? [...prev, c].sort() : prev.filter((x) => x !== c)) as MaterialClass[]);
                            invalidatePlan();
                          }}
                        />
                      }
                      label={c}
                    />
                  ))}
                </Box>

                <CommonButton onClick={handleGenerate} disabled={busy}>
                  {previewing ? <CircularProgress size={22} color="inherit" /> : "GENERATE PLAN"}
                </CommonButton>
              </Box>

              {preview && (
                <>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    <Stat label="Movements in period" value={preview.movement.lines} />
                    <Stat label="From live data" value={preview.movement.liveLines} />
                    <Stat label="From archived data" value={preview.movement.archivedLines} />
                    <Stat label="Locations moved" value={preview.movement.locationsMoved} />
                    <Stat label="Locations matching filters" value={preview.candidateCount} />
                  </Box>
                  {preview.filters.notes.map((n) => (
                    <Alert key={n} severity="warning">
                      {n}
                    </Alert>
                  ))}
                  <Typography variant="body2" fontWeight={700}>
                    {method === "MANUAL"
                      ? `Tick the locations to audit – ${manualSel.size} of ${preview.candidates?.length ?? 0} selected`
                      : `Plan preview – ${preview.plan.length} location${preview.plan.length === 1 ? "" : "s"} (${SELECTION_METHOD_LABELS[method].toLowerCase()})`}
                  </Typography>
                  <CycleCountPlanTable
                    rows={method === "MANUAL" ? preview.candidates ?? [] : preview.plan}
                    selectable={method === "MANUAL"}
                    selected={manualSel}
                    onToggle={(bin) =>
                      setManualSel((prev) => {
                        const next = new Set(prev);
                        if (next.has(bin)) next.delete(bin);
                        else if (next.size < MAX_LOCATIONS) next.add(bin);
                        return next;
                      })
                    }
                    onToggleAll={(bins, checked) =>
                      setManualSel((prev) => {
                        const next = new Set(prev);
                        bins.forEach((b) => (checked ? next.size < MAX_LOCATIONS && next.add(b) : next.delete(b)));
                        return next;
                      })
                    }
                    showCnc={upload.hasCncColumn}
                    showClass={upload.hasClassColumn}
                  />
                </>
              )}
            </Step>

            {/* ---------------- 4. Assign & release ---------------- */}
            <Step no="4" title="Assign & release" hint="The locations are shared between the selected operators. One audit is created per operator.">
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <TextField
                  label="Audit Name"
                  size="small"
                  value={auditName}
                  onChange={(e) => setAuditName(e.target.value)}
                  inputProps={{ maxLength: 255 }}
                  sx={{ flex: "1 1 260px" }}
                />
                <Autocomplete
                  multiple
                  size="small"
                  options={operators}
                  value={selectedOps}
                  onChange={(_, v) => setSelectedOps(v)}
                  getOptionLabel={(o) => `${o.name} (${o.email})`}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  filterSelectedOptions
                  renderInput={(params) => <TextField {...params} label="Operators" placeholder="Select operators" />}
                  sx={{ flex: "2 1 360px" }}
                />
              </Box>
              {shareInfo && (
                <Typography variant="body2" color="text.secondary">
                  {shareInfo}
                </Typography>
              )}
            </Step>
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ whiteSpace: "pre-line", maxHeight: 220, overflowY: "auto" }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {planRows.length > 0 && (
          <Typography variant="body2" sx={{ mr: "auto" }}>
            Release <strong>{planRows.length}</strong> location{planRows.length === 1 ? "" : "s"}
            {selectedOps.length ? (
              <>
                {" "}to <strong>{selectedOps.length} operator{selectedOps.length === 1 ? "" : "s"}</strong>
              </>
            ) : null}
          </Typography>
        )}
        <CommonButton onClick={handleClose} disabled={releasing}>
          CANCEL
        </CommonButton>
        <CommonButton onClick={handleRelease} disabled={busy || !planRows.length}>
          {releasing ? <CircularProgress size={22} color="inherit" /> : "RELEASE TO HANDHELD"}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
}
