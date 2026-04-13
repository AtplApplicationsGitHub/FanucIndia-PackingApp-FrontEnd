"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  Popper,
  Paper,
  ClickAwayListener,
  ListItemButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { API } from "@/common/lib/endpoints";
import CommonButton from "@/common/components/CommonButton";

type MentionUser = { id: number; name: string; role: string; email: string };

type ChatMessage = {
  id: number;
  message: string;
  createdAt: string;
  fromUser: { id: number; name: string; role: string; email: string };
  toUser: { id: number; name: string; role: string; email: string };
};

export default function SoChatDrawer({
  open,
  onClose,
  orderId,
  soNumber,
}: {
  open: boolean;
  onClose: () => void;
  orderId: number | null;
  soNumber: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [taggedUser, setTaggedUser] = useState<MentionUser | null>(null);

  // "@ mention" filtering
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);

  const [accessDenied, setAccessDenied] = useState(false);

  // Keep focus in the textbox, anchor popper to it
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const token = useMemo(
    () =>
      typeof window !== "undefined" ? localStorage.getItem("token") : null,
    []
  );

  const refresh = async () => {
    if (!orderId || !token) return;
    setLoading(true);
    setAccessDenied(false);
    try {
      try {
        await axios.delete(API.SO_NOTIFICATIONS.CLEAR_SO(orderId), {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Failed to clear notifications", err);
      }

      const [u, m] = await Promise.all([
        axios.get(API.SO_CHAT.MENTION_USERS(orderId), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(API.SO_CHAT.MESSAGES(orderId), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUsers(u.data || []);
      setMessages(m.data || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setAccessDenied(true);
      } else {
        console.error("Failed to fetch chat data:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderId]);

  const filteredUsers = useMemo(() => {
    const q = mentionQuery.trim().toLowerCase();
    if (!q) return users; // show all right after "@"
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, mentionQuery]);

  const updateMentionStateFromText = (val: string) => {
    const lastToken = val.split(/\s/).pop() || "";

    // Open/filter when the user is currently typing a token that begins with "@"
    if (lastToken.startsWith("@")) {
      setMentionQuery(lastToken.slice(1));
      setMentionOpen(true);
      return;
    }

    setMentionQuery("");
    setMentionOpen(false);
  };

  const insertMention = (u: MentionUser) => {
    // replace last @token with @Name
    const parts = text.split(/\s/);
    const last = parts[parts.length - 1] || "";

    if (last.startsWith("@")) {
      parts[parts.length - 1] = `@${u.email}`; 
    } else {
      parts.push(`@${u.email}`);
    }

    const next = parts.join(" ") + " ";
    setText(next);
    setTaggedUser(u);

    // close popper
    setMentionQuery("");
    setMentionOpen(false);

    // ✅ keep cursor at end (after React updates value)
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      const pos = next.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handleSend = async () => {
    if (!orderId || !token) return;
    if (!taggedUser) return; // force tagging
    const msg = text.trim();
    if (!msg) return;

    setSending(true);
    try {
      await axios.post(
        API.SO_CHAT.SEND(orderId),
        { toUserId: taggedUser.id, message: msg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setText("");
      setTaggedUser(null);
      setMentionQuery("");
      setMentionOpen(false);
      await refresh();
    } finally {
      setSending(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 420,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            SO Chat {soNumber ? `(${soNumber})` : ""}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : accessDenied ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 4,
                px: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                You are not authorized to access the chat for this order.
              </Typography>
            </Box>
          ) : messages.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No messages yet. Start by tagging someone using @
            </Typography>
          ) : (
            <List sx={{ p: 0 }}>
              {messages.map((m) => (
                <Box key={m.id}>
                  <ListItem sx={{ px: 0, alignItems: "flex-start" }}>
                    <ListItemText
                      primary={
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 1, 
                            alignItems: 'baseline',
                            mb: 0.5 
                          }}
                        >
                          <Typography 
                            fontWeight={700} 
                            sx={{ wordBreak: 'break-all' }}
                          >
                            {m.fromUser.email}
                          </Typography>
                          
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ wordBreak: 'break-all' }}
                          >
                            → @{m.toUser.email}
                          </Typography>
                          
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            {new Date(m.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          sx={{ wordBreak: 'break-word', mt: 0.5 }}
                        >
                          {m.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
          )}
        </Box>

        {!accessDenied && (
          <Box sx={{ p: 2, borderTop: "1px solid #eee", position: "relative" }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="Type message... use @ to tag"
              value={text}
              inputRef={(el) => {
                // For multiline TextField, ref is textarea
                inputRef.current = el;
              }}
              onChange={(e) => {
                const val = e.target.value;
                setText(val);
                updateMentionStateFromText(val);
              }}
              onKeyDown={(e) => {
                // Ctrl+Enter send
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSend();
                // Escape closes mention list
                if (e.key === "Escape") setMentionOpen(false);
              }}
            />

            {/* Mention dropdown that DOES NOT steal focus */}
            <Popper
              open={mentionOpen}
              anchorEl={inputRef.current}
              placement="top-start"
              style={{ zIndex: 1500 }}
              disablePortal
            >
              <ClickAwayListener onClickAway={() => setMentionOpen(false)}>
                <Paper
                  sx={{ width: 280, maxHeight: 280, overflowY: "auto", mt: 1 }}
                >
                  {filteredUsers.length === 0 ? (
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        No matches
                      </Typography>
                    </Box>
                  ) : (
                    <List dense sx={{ p: 0 }}>
                      {filteredUsers.map((u) => (
                        <ListItemButton
                          key={u.id}
                          onClick={() => insertMention(u)}
                        >
                          <ListItemText
                            primary={`@${u.email}`}
                            secondary={u.role}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  )}
                </Paper>
              </ClickAwayListener>
            </Popper>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                mt: 1,
              }}
            >
              <CommonButton
                startIcon={
                  sending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SendIcon />
                  )
                }
                onClick={handleSend}
                disabled={sending || !taggedUser || !text.trim()}
              >
                SEND
              </CommonButton>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
