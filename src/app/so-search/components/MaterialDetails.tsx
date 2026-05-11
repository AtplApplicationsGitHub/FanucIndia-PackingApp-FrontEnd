import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { useState, useMemo } from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CommonButton from "@/common/components/CommonButton";
import { formatDateTimeIST } from "@/common/utils/dateTime";

interface MaterialDetail {
  ID: number;
  Material_Code: string;
  Material_Description: string;
  Batch_No: string;
  SO_Donor_Batch?: string;
  Cert_No?: string;
  Bin_No?: string;
  A_D_F?: string;
  Required_Qty: number;
  Issue_stage: number;
  Packing_stage: number;
  IssueUpdatedBy?: string;
  IssueUpdatedDate?: string;
  PackingUpdatedBy?: string;
  PackingUpdatedDate?: string;
  UpdatedBy?: string;
  UpdatedDate?: string;
  Remarks?: string;
  Remarks_Required?: boolean;
  Group?: string;
  Classification?: string;
}

interface Props {
  materialDetails: MaterialDetail[];
  onViewAttachments: () => void;
}

export default function MaterialDetails({
  materialDetails,
  onViewAttachments,
}: Props) {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.1 : 0.25);

  //  Group Filter State
  const [groupFilter, setGroupFilter] = useState<string>("All");
  const [classificationFilter, setClassificationFilter] = useState<string>("All");

  //  Extract unique groups from the data
  const uniqueGroups = useMemo(() => {
    const list = materialDetails || [];
    const groups = list.map((m) => m.Group).filter((g): g is string => !!g);
    return ["All", ...Array.from(new Set(groups)).sort()];
  }, [materialDetails]);

  // Extract unique classifications from the data
  const uniqueClassifications = useMemo(() => {
    const list = materialDetails || [];
    const classifications = list.map((m) => m.Classification).filter((c): c is string => !!c);
    return ["All", ...Array.from(new Set(classifications)).sort()];
  }, [materialDetails]);

  //  Filter materials based on selected group AND classification
  const displayMaterials = useMemo(() => {
    const list = materialDetails || [];
    return list.filter((m) => {
      const matchGroup = groupFilter === "All" || m.Group === groupFilter;
      const matchClassification = classificationFilter === "All" || m.Classification === classificationFilter;
      return matchGroup && matchClassification;
    });
  }, [materialDetails, groupFilter, classificationFilter]);

  // Calculate Durations and Extract User Names for Issue and Packing Stages
  const { issueDuration, packingDuration, issueUpdatedBy, packingUpdatedBy } = useMemo(() => {
    const calculate = (dates: (string | undefined)[]) => {
      const validDates = dates
        .filter((d): d is string => !!d)
        .map((d) => new Date(d).getTime());

      if (validDates.length === 0) return null;
      if (validDates.length === 1) return "0 mins";

      const min = Math.min(...validDates);
      const max = Math.max(...validDates);
      const diffMins = Math.floor((max - min) / 60000);

      if (diffMins === 0) return "0 mins";
      if (diffMins < 60) return `${diffMins} mins`;
      if (diffMins < 1440) {
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hrs} hr${hrs > 1 ? "s" : ""}${mins > 0 ? ` ${mins} min${mins > 1 ? "s" : ""}` : ""}`;
      }
      const days = Math.floor(diffMins / 1440);
      const hrs = Math.floor((diffMins % 1440) / 60);
      return `${days} day${days > 1 ? "s" : ""}${hrs > 0 ? ` ${hrs} hr${hrs > 1 ? "s" : ""}` : ""}`;
    };

    const firstIssueUser = materialDetails?.find((m) => m.IssueUpdatedBy)?.IssueUpdatedBy || null;
    const firstPackingUser = materialDetails?.find((m) => m.PackingUpdatedBy)?.PackingUpdatedBy || null;

    return {
      issueDuration: calculate(materialDetails?.map((m) => m.IssueUpdatedDate)),
      packingDuration: calculate(materialDetails?.map((m) => m.PackingUpdatedDate)),
      issueUpdatedBy: firstIssueUser,
      packingUpdatedBy: firstPackingUser,
    };
  }, [materialDetails]);

  const handleGroupChange = (event: SelectChangeEvent) => {
    setGroupFilter(event.target.value as string);
  };

  const handleClassificationChange = (event: SelectChangeEvent) => {
    setClassificationFilter(event.target.value as string);
  };

  // State for Remarks Dialog
  const [openRemarks, setOpenRemarks] = useState(false);
  const [currentRemarks, setCurrentRemarks] = useState("");

  const handleOpenRemarks = (remarks: string) => {
    setCurrentRemarks(remarks);
    setOpenRemarks(true);
  };

  const handleCloseRemarks = () => {
    setOpenRemarks(false);
    setCurrentRemarks("");
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }} id="material-section">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="baseline" gap={3}>
          <Typography
            sx={{ color: "secondary.main", fontWeight: 600, fontSize: "20px" }}
          >
            MATERIALS
          </Typography>
          {issueDuration && (
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#f5f5f5",
                px: 1.5,
                py: 0.8,
                borderRadius: 1,
                border: "1px solid",
                borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0",
                display: "flex",
                alignItems: "center",
                gap: 0.5
              }}
            >
              Issue Duration: <span style={{ color: theme.palette.error.main }}>{issueDuration}</span>
              {issueUpdatedBy && (
                <Typography component="span" variant="caption" sx={{ color: "text.secondary", ml: 0.5, fontWeight: 500 }}>
                  ({issueUpdatedBy})
                </Typography>
              )}
            </Typography>
          )}
          {packingDuration && (
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#f5f5f5",
                px: 1.5,
                py: 0.8,
                borderRadius: 1,
                border: "1px solid",
                borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0",
                display: "flex",
                alignItems: "center",
                gap: 0.5
              }}
            >
              Packing Duration: <span style={{ color: theme.palette.info.main }}>{packingDuration}</span>
              {packingUpdatedBy && (
                <Typography component="span" variant="caption" sx={{ color: "text.secondary", ml: 0.5, fontWeight: 500 }}>
                  ({packingUpdatedBy})
                </Typography>
              )}
            </Typography>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Group Filter Dropdown */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="classification-filter-label">Classification</InputLabel>
            <Select
              labelId="classification-filter-label"
              id="classification-filter"
              value={classificationFilter}
              label="Classification"
              onChange={handleClassificationChange}
              sx={{ borderRadius: 1 }}
            >
              {uniqueClassifications.map((cls) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="group-filter-label">Group</InputLabel>
            <Select
              labelId="group-filter-label"
              id="group-filter"
              value={groupFilter}
              label="Group"
              onChange={handleGroupChange}
              sx={{ borderRadius: 1 }}
            >
              {uniqueGroups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <CommonButton
            onClick={onViewAttachments}
          >
            ATTACHMENTS
          </CommonButton>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table
        size="small"
          sx={{
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: lightYellow,
            },
          }}
        >
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>Material Code</TableCell>
              <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>Batch</TableCell>
              <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>SO Donor</TableCell>
              <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>Cert No</TableCell>
              <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>Bin</TableCell>
              <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>A/D/F</TableCell>
              <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>Required Quantity</TableCell>
              <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>Issue</TableCell>
              <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>Packing</TableCell>
              <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>Issue Updated Date</TableCell>
              <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>Packing Updated Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayMaterials.map((m) => (
              <TableRow key={m.ID}>
                <TableCell>
                  {m.Remarks ? (
                    <Typography
                      component="span"
                      onClick={() => handleOpenRemarks(m.Remarks || "")}
                      sx={{
                        textDecoration: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        color: theme.palette.mode === "dark" ? theme.palette.primary.main : "#0000FF",
                        fontSize: "inherit",
                        "&:hover": { color: theme.palette.mode === "dark" ? theme.palette.primary.light : "#00008B", textDecoration: "none" },
                      }}
                    >
                      {m.Material_Code}
                    </Typography>
                  ) : (
                    m.Material_Code
                  )}
                </TableCell>
                <TableCell>{m.Material_Description}</TableCell>
                <TableCell>{m.Batch_No}</TableCell>
                <TableCell>{m.SO_Donor_Batch || "-"}</TableCell>
                <TableCell>{m.Cert_No || "-"}</TableCell>
                <TableCell>{m.Bin_No || "-"}</TableCell>
                <TableCell>{m.A_D_F || "-"}</TableCell>
                <TableCell>{m.Required_Qty}</TableCell>
                <TableCell>{m.Issue_stage}</TableCell>
                <TableCell>{m.Packing_stage}</TableCell>
                <TableCell>
                  {m.IssueUpdatedDate
                    ? formatDateTimeIST(m.IssueUpdatedDate)
                    : "-"}
                </TableCell>
                <TableCell>
                  {m.PackingUpdatedDate
                    ? formatDateTimeIST(m.PackingUpdatedDate)
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
            {displayMaterials.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No material details found for this group.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openRemarks}
        onClose={handleCloseRemarks}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            textTransform: "uppercase",
            fontWeight: "bold",
            color: theme.palette.mode === "dark" ? theme.palette.error.light : "#CE0000",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          Remarks
          <IconButton
            aria-label="close"
            onClick={handleCloseRemarks}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText
            sx={{ whiteSpace: "pre-wrap", color: "text.primary" }}
          >
            {currentRemarks}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
