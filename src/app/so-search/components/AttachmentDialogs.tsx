import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import { Close, FilePresent, Visibility, Download } from "@mui/icons-material";
import { Tooltip } from "@mui/material";

interface Attachment {
  fileName: string;
}

interface MaterialAttachment extends Attachment {
  ID: number;
  description: string | null;
}

interface DispatchInfo {
  id: number;
  attachments?: Attachment[];
}

interface Props {
  dispatchDialogOpen: boolean;
  onDispatchDialogClose: () => void;
  dispatchAttachments: Attachment[];
  onDispatchAttachmentAction: (
    dispatchId: number,
    fileName: string,
    action: "view" | "download"
  ) => void;
  dispatchInfo: DispatchInfo[];
  materialDialogOpen: boolean;
  onMaterialDialogClose: () => void;
  materialAttachments: MaterialAttachment[];
  onMaterialAttachmentView: (id: number) => void;
  onMaterialAttachmentDownload: (id: number) => void;
}

export default function AttachmentDialogs({
  dispatchDialogOpen,
  onDispatchDialogClose,
  dispatchAttachments,
  onDispatchAttachmentAction,
  dispatchInfo,
  materialDialogOpen,
  onMaterialDialogClose,
  materialAttachments,
  onMaterialAttachmentView,
  onMaterialAttachmentDownload,
}: Props) {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);
  return (
    <>
      <Dialog
        open={dispatchDialogOpen}
        onClose={onDispatchDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ color: "secondary.main", fontWeight: 600 }}>
          DISPATCH ATTACHMENTS
          <IconButton
            onClick={onDispatchDialogClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper}>
            <Table
              sx={{
                "& .MuiTableCell-root": {
                  borderBottom: "1px solid #1F2933",
                },
                "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                  backgroundColor: lightYellow,
                },
                "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root":
                  {
                    borderBottom: 0,
                  },
              }}
            >
              <TableHead sx={{ bgcolor: "primary.main" }}>
                <TableRow>
                  <TableCell
                    sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                  >
                    File Name
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: "primary.contrastText",
                      fontWeight: "bold",
                      width: "150px",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dispatchAttachments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      <Typography color="text.secondary" p={3}>
                        No attachments found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  dispatchAttachments.map((att, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <FilePresent color="action" />
                          <Typography variant="body2">
                            {att.fileName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() =>
                              onDispatchAttachmentAction(
                                dispatchInfo[0].id,
                                att.fileName,
                                "view"
                              )
                            }
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() =>
                              onDispatchAttachmentAction(
                                dispatchInfo[0].id,
                                att.fileName,
                                "download"
                              )
                            }
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      <Dialog
        open={materialDialogOpen}
        onClose={onMaterialDialogClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle sx={{ color: "secondary.main", fontWeight: 600 }}>
          MATERIAL ATTACHMENTS
          <IconButton
            onClick={onMaterialDialogClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper}>
            <Table
              sx={{
                "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                  backgroundColor: lightYellow,
                },
                "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root":
                  {
                    borderBottom: 0,
                  },
              }}
            >
              <TableHead sx={{ bgcolor: "primary.main" }}>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      color: "primary.contrastText",
                      fontWeight: "bold",
                      width: "30%",
                    }}
                  >
                    File Name
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                  >
                    Description
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: "primary.contrastText",
                      fontWeight: "bold",
                      width: "20%",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materialAttachments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography color="text.secondary" p={3}>
                        No attachments found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  materialAttachments.map((att) => (
                    <TableRow key={att.ID}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <FilePresent color="action" />
                          <Typography variant="body2">
                            {att.fileName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                      >
                        {att.description || "—"}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => onMaterialAttachmentView(att.ID)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => onMaterialAttachmentDownload(att.ID)}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </>
  );
}
