import { Box, Typography } from '@mui/material';
import { CheckCircle, XCircle } from 'lucide-react';

const checks = [
  {
    label: 'At least 8 characters',
    test: (pw: string) => pw.length >= 8,
  },
  {
    label: 'At least 2 special characters (!@#$%^&*)',
    test: (pw: string) => (pw.match(/[!@#$%^&*]/g) || []).length >= 2,
  },
  {
    label: 'At least 2 numbers',
    test: (pw: string) => (pw.match(/\d/g) || []).length >= 2,
  },
  {
    label: 'At least 1 uppercase letter',
    test: (pw: string) => /[A-Z]/.test(pw),
  },
];

export default function PasswordStrength({ password }: { password?: string }) {
  if (!password) return null;

  const results = checks.map(c => c.test(password));
  const allOk = results.every(Boolean);

  if (allOk) return null;

  return (
    <Box mt={1}>
      {checks.map((c, i) => {
        const ok = results[i];
        return (
          <Box key={c.label} display="flex" alignItems="center" gap={1}>
            {ok ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : (
              <XCircle size={16} className="text-red-600" />
            )}
            <Typography variant="caption" color={ok ? 'success.main' : 'error'}>
              {c.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
