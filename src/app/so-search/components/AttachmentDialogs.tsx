import {
  Button,
  Dialog,
  DialogActions,
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
} from "@mui/material";
import { Close, FilePresent } from "@mui/icons-material";

// Define minimal types for the props
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
  onDispatchAttachmentAction: (dispatchId: number, fileName: string, action: "view" | "download") => void;
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
  return (
    <>
      {/* Dispatch Attachment Dialog */}
      <Dialog open={dispatchDialogOpen} onClose={onDispatchDialogClose} fullWidth maxWidth="md">
        <DialogTitle>
          Dispatch Attachments
          <IconButton
            onClick={onDispatchDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>File Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dispatchAttachments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      <Typography color="text.secondary" p={3}>No attachments found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  dispatchAttachments.map((att, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <FilePresent color="action" />
                          <Typography variant="body2">{att.fileName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => onDispatchAttachmentAction(dispatchInfo[0].id, att.fileName, "view")}>View</Button>
                        <Button size="small" onClick={() => onDispatchAttachmentAction(dispatchInfo[0].id, att.fileName, "download")}>Download</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDispatchDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Material Attachment Dialog */}
      <Dialog open={materialDialogOpen} onClose={onMaterialDialogClose} fullWidth maxWidth="lg">
        <DialogTitle>
          Material Attachments
          <IconButton onClick={onMaterialDialogClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>File Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materialAttachments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                       <Typography color="text.secondary" p={3}>No attachments found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  materialAttachments.map((att) => (
                    <TableRow key={att.ID}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                           <FilePresent color="action" />
                           <Typography variant="body2">{att.fileName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {att.description || '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => onMaterialAttachmentView(att.ID)}>View</Button>
                        <Button size="small" onClick={() => onMaterialAttachmentDownload(att.ID)}>Download</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onMaterialDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}