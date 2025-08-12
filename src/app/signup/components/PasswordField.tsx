import {
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Eye, EyeClosed, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { SignupFormData } from '@/app/signup/components/SignupForm';

const checks = [
  { test: (pw: string) => pw.length >= 8 },
  { test: (pw: string) => (pw.match(/[!@#$%^&*]/g) || []).length >= 2 },
  { test: (pw: string) => (pw.match(/\d/g) || []).length >= 2 },
  { test: (pw: string) => /[A-Z]/.test(pw) },
];

export default function PasswordField({ disabled }: { disabled?: boolean }) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SignupFormData>();
  const [show, setShow] = useState(false);

  const password = watch('password') || '';

  const allOk = checks.map(c => c.test(password)).every(Boolean);

  return (
    <TextField
      label="Password"
      type={show ? 'text' : 'password'}
      fullWidth
      disabled={disabled}
      {...register('password', { required: 'Password is required' })}
      error={!!errors.password}
      helperText={errors.password?.message}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {/* show/hide toggle always */}
              <IconButton onClick={() => setShow(v => !v)} edge="end">
                {show ? <Eye size={20} /> : <EyeClosed size={20} />}
              </IconButton>
              {allOk && (
                <CheckCircle
                  size={18}
                  className="text-green-600"
                  style={{ marginLeft: 8 }}
                />
              )}
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
