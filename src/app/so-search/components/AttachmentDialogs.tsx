import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
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

  packingDrawerOpen: boolean;
  onPackingDrawerClose: () => void;

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
  packingDrawerOpen,
  onPackingDrawerClose,
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
          <List>
            {dispatchAttachments.length === 0 ? (
              <ListItem><ListItemText primary="No attachments found." /></ListItem>
            ) : (
              dispatchAttachments.map((att, i) => (
                <ListItem
                  key={i}
                  secondaryAction={
                    <>
                      <Button size="small" onClick={() => onDispatchAttachmentAction(dispatchInfo[0].id, att.fileName, "view")}>View</Button>
                      <Button size="small" onClick={() => onDispatchAttachmentAction(dispatchInfo[0].id, att.fileName, "download")}>Download</Button>
                    </>
                  }
                >
                  <ListItemIcon><FilePresent /></ListItemIcon>
                  <ListItemText primary={att.fileName} />
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDispatchDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Packing Attachment Drawer (Dummy) */}
      <Drawer
        anchor="right"
        open={packingDrawerOpen}
        onClose={onPackingDrawerClose}
      >
        <Box sx={{ width: 400, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Packing Attachments</Typography>
            <IconButton onClick={onPackingDrawerClose}><Close /></IconButton>
          </Box>
          <List>
            <ListItem><ListItemText primary="Dummy packing attachment." /></ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Material Attachment Dialog */}
      <Dialog open={materialDialogOpen} onClose={onMaterialDialogClose} fullWidth maxWidth="md">
        <DialogTitle>
          Material Attachments
          <IconButton onClick={onMaterialDialogClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {materialAttachments.length === 0 ? (
              <ListItem><ListItemText primary="No attachments found." /></ListItem>
            ) : (
              materialAttachments.map((att) => (
                <ListItem
                  key={att.ID}
                  secondaryAction={
                    <>
                      <Button size="small" onClick={() => onMaterialAttachmentView(att.ID)}>View</Button>
                      <Button size="small" onClick={() => onMaterialAttachmentDownload(att.ID)}>Download</Button>
                    </>
                  }
                >
                  <ListItemIcon><FilePresent /></ListItemIcon>
                  <ListItemText primary={att.fileName} secondary={att.description} />
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onMaterialDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}