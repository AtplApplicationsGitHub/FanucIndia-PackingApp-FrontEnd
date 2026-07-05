import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import { UploadCloud, X as CloseIcon, File as FileIcon } from "lucide-react";
import axios from "axios";
import { API } from "@/common/lib/endpoints";
import { useTheme } from "@mui/material/styles";
import CommonButton from "@/common/components/CommonButton";

export default function ErpUploadDialog({
  open,
  onClose,
  onUploadSuccess,
  saleOrderNumber,
}: {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  saleOrderNumber: string | null;
}) {
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (
        [
          "text/csv",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ].includes(selectedFile.type)
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Invalid file type. Please upload a .xlsx file.");
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (saleOrderNumber) {
      formData.append("saleOrderNumber", saleOrderNumber);
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(API.ERP_IMPORTER.UPLOAD, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      onUploadSuccess();
    } catch (err: unknown) {
      let msg = "An unexpected error occurred.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(", ")
          : err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const [obdOptions, setObdOptions] = useState<
    { obd: string; filename: string }[]
  >([]);
  const [selectedObd, setSelectedObd] = useState("");

  const handleImportDrive = async () => {
    if (!saleOrderNumber) return;
    setImportLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    try {
      // Step 1: Try the normal import first (uses OBD already saved in DB)
      await axios.post(
        API.ERP_IMPORTER.IMPORT_FROM_DRIVE,
        { saleOrderNumber },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onUploadSuccess();
      return;
    } catch (err: unknown) {
      // Only fall back to the dropdown if the file genuinely wasn't found
      if (!(axios.isAxiosError(err) && err.response?.status === 404)) {
        let msg = "An unexpected error occurred during drive import.";
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          msg = Array.isArray(err.response.data.message)
            ? err.response.data.message.join(", ")
            : err.response.data.message;
        }
        setError(msg);
        setImportLoading(false);
        return;
      }
    }

    // Step 2: Correct file wasn't found — look for alternatives
    try {
      const res = await axios.post(
        API.ERP_IMPORTER.ACTIVE_OBD_OPTIONS,
        { saleOrderNumber },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const options = res.data as { obd: string; filename: string }[];

      if (options.length === 0) {
        setError(
          `No file found in the Active folder for SO ${saleOrderNumber}.`,
        );
      } else {
        setObdOptions(options); // show dropdown
      }
    } catch {
      setError("Could not check the Active folder for matching files.");
    } finally {
      setImportLoading(false);
    }
  };

  const handleConfirmObdAndImport = async () => {
    if (!saleOrderNumber || !selectedObd) return;
    setImportLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        API.ERP_IMPORTER.IMPORT_FROM_DRIVE,
        { saleOrderNumber, obd: selectedObd },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setObdOptions([]);
      onUploadSuccess();
    } catch (err: unknown) {
      let msg = "An unexpected error occurred during drive import.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(", ")
          : err.response.data.message;
      }
      setError(msg);
    } finally {
      setImportLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setLoading(false);
    setImportLoading(false);
    setError(null);
    setIsDragging(false);
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
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
        UPLOAD MATERIAL DATA
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: "absolute", right: 12 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 1 }}>
        <Box mt={1}>
          <Typography variant="body1">
            Please upload the corresponding Excel for Sales Order{" "}
            <strong>{saleOrderNumber}</strong>.
          </Typography>
        </Box>

        {!file ? (
          <Box
            component="label"
            htmlFor="erp-file-upload"
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            sx={{
              mt: 3,
              p: 8,
              border: (theme) =>
                `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              cursor: "pointer",
              bgcolor: isDragging ? "action.hover" : "transparent",
              transition: "background-color 0.2s, border-color 0.2s",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
          >
            <UploadCloud size={30} color="grey" />
            <Typography fontSize={17} fontWeight={500} color="text.primary">
              Click or drag to upload
            </Typography>
            <Typography fontSize={15} color="text.secondary">
              Supports: .xlsx
            </Typography>
            <input
              id="erp-file-upload"
              type="file"
              hidden
              accept=".xlsx"
              onChange={(e) =>
                handleFileChange(e.target.files ? e.target.files[0] : null)
              }
            />
          </Box>
        ) : (
          <Box
            sx={{
              mt: 2,
              p: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <FileIcon size={24} />
              <Typography sx={{ fontWeight: 500 }}>{file.name}</Typography>
            </Box>
            <IconButton
              onClick={() => setFile(null)}
              size="small"
              aria-label="Remove file"
            >
              <CloseIcon size={18} />
            </IconButton>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {obdOptions.length > 1 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Multiple files found for SO <strong>{saleOrderNumber}</strong>.
              Select the correct OBD:
            </Typography>
            <select
              value={selectedObd}
              onChange={(e) => setSelectedObd(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            >
              <option value="">-- Select OBD --</option>
              {obdOptions.map((o) => (
                <option key={o.obd} value={o.obd}>
                  {o.filename}
                </option>
              ))}
            </select>
            <CommonButton
              sx={{ mt: 1 }}
              onClick={handleConfirmObdAndImport}
              disabled={!selectedObd || importLoading}
            >
              {importLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "CONFIRM & IMPORT"
              )}
            </CommonButton>
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <CommonButton
          onClick={handleImportDrive}
          disabled={loading || importLoading}
        >
          {importLoading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "IMPORT ERP DATA"
          )}
        </CommonButton>
        <CommonButton
          onClick={handleUpload}
          disabled={!file || loading || importLoading}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : "UPLOAD"}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
}
