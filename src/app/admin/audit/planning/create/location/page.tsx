"use client";

import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import CommonButton from "@/common/components/CommonButton";

export default function CreateLocationAuditPage() {
  const router = useRouter();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700}>
        Create Location Audit
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Location Audit creation is not implemented yet.
      </Typography>

      <CommonButton onClick={() => router.push("/admin/audit/planning")}>
        BACK TO PLANNING
      </CommonButton>
    </Box>
  );
}
