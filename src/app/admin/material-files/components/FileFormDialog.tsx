'use client'
import { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from '@mui/material'
import type { CreateMaterialFileInput, MaterialFile } from '@/app/admin/material-files/types/material-file'

export default function FileFormDialog({
  open,
  initial,
  onClose,
  onSubmit,
  submitting,
  lockSaleOrderNumber,
}: {
  open: boolean
  initial?: Partial<MaterialFile>
  onClose: () => void
  onSubmit: (values: CreateMaterialFileInput) => void | Promise<void>
  submitting?: boolean
  lockSaleOrderNumber?: boolean
}) {
  const [saleOrderNumber, setSONumber] = useState('')
  const [fileName, setFileName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    setSONumber(initial?.saleOrderNumber ?? '')
    setFileName(initial?.fileName ?? '')
    setDescription(initial?.description ?? '')
  }, [initial, open])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>{initial?.ID ? 'Edit File' : 'New File'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Sale Order Number"
            value={saleOrderNumber}
            onChange={(e) => setSONumber(e.target.value)}
            placeholder="SO-2025-000123"
            disabled={!!lockSaleOrderNumber}
          />
          <TextField
            label="File Name"
            required
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="packing_list_SO-2025-000123.pdf"
          />
          <TextField
            label="Description"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          onClick={() => onSubmit({
            saleOrderNumber: saleOrderNumber?.trim() || undefined,
            fileName: fileName.trim(),
            description: description?.trim() || undefined,
          })}
          disabled={submitting || !fileName.trim()}
          variant="contained"
        >
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
