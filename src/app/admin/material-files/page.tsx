'use client'
import * as React from 'react'
import FilesHeader from '@/app/admin/material-files/components/Header'
import FilesTable from '@/app/admin/material-files/components/FilesTable'
import FileFormDialog from '@/app/admin/material-files/components/FileFormDialog'
import ConfirmDeleteDialog from '@/common/components/ConfirmDeleteDialog'
import { Box, Button, Snackbar, Alert, Stack, TextField, Pagination } from '@mui/material'
import { useFilesList, useFileMutations } from '@/app/admin/material-files/hooks/useFiles'
import type { MaterialFile } from '@/app/admin/material-files/types/material-file'
import MultiFileUploadDialog from '@/app/admin/material-files/components/MultiFileUploadDialog'

export default function MaterialFilesPage() {
  const { data, loading, error, params, setParams, reload } = useFilesList({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [editRow, setEditRow] = React.useState<MaterialFile | null>(null)
  const [deleteRow, setDeleteRow] = React.useState<MaterialFile | null>(null)

  // We still use mutations for edit/delete. "create" flow is replaced by Upload dialog.
  const mutations = useFileMutations(() => {
    setEditRow(null)
    void reload()
  })

  const pages = data?.meta.pages ?? 1
  const page = data?.meta.page ?? params.page ?? 1

  return (
    <>
      <Box sx={{ p: 3 }}>
        <FilesHeader />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Search"
            size="small"
            value={params.search || ''}
            onChange={(e) => setParams((p) => ({ ...p, page: 1, search: e.target.value }))}
            placeholder="file name / description / SO"
          />
          <TextField
            label="Sale Order Number"
            size="small"
            value={params.saleOrderNumber || ''}
            onChange={(e) => setParams((p) => ({ ...p, page: 1, saleOrderNumber: e.target.value }))}
            placeholder="SO-2025-000123"
          />
          <Button variant="contained" onClick={() => setUploadOpen(true)}>
            Upload
          </Button>
        </Stack>

        {loading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Loading…
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FilesTable
          rows={data?.items || []}
          onEdit={(row) => setEditRow(row)}
          onDelete={(row) => setDeleteRow(row)}
        />

        <Stack alignItems="center" sx={{ mt: 2 }}>
          <Pagination
            count={pages}
            page={page}
            onChange={(_, p) => setParams((prev) => ({ ...prev, page: p }))}
          />
        </Stack>

        {/* Upload (new) */}
        <MultiFileUploadDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => {
            void reload()
          }}
        />

        {/* Edit (metadata only) */}
        <FileFormDialog
          open={!!editRow}
          initial={editRow || undefined}
          onClose={() => setEditRow(null)}
          onSubmit={async (values) => {
            if (!editRow) return
            await mutations.update(editRow.ID, values)
          }}
          submitting={mutations.loading}
        />

        {/* Delete */}
        <ConfirmDeleteDialog
          open={!!deleteRow}
          title="Delete file?"
          description={deleteRow ? `This will permanently remove "${deleteRow.fileName}".` : ''}
          onCancel={() => setDeleteRow(null)}
          onConfirm={async () => {
            if (!deleteRow) return
            await mutations.remove(deleteRow.ID)
            setDeleteRow(null)
          }}
        />

        <Snackbar open={!!error} autoHideDuration={4000}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      </Box>
    </>
  )
}
