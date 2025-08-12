'use client'
import { Box, Typography } from '@mui/material'

export default function FilesHeader() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h5" fontWeight={600}>ERP Material Files</Typography>
    </Box>
  )
}
