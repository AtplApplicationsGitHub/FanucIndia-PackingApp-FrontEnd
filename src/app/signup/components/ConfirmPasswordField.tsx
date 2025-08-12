import {
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Eye, EyeClosed } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { SignupFormData } from '@/app/signup/components/SignupForm';

export default function ConfirmPasswordField({ disabled }: { disabled?: boolean }) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SignupFormData>();
  const [showConfirm, setShowConfirm] = useState(false);
  const password = watch('password');

  return (
    <TextField
      label="Retype Password"
      type={showConfirm ? 'text' : 'password'}
      fullWidth
      disabled={disabled}
      {...register('confirmPassword', {
        required: 'Retype password is required',
        validate: value =>
          value === password || 'Passwords do not match',
      })}
      error={!!errors.confirmPassword}
      helperText={errors.confirmPassword?.message}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                {showConfirm ? <Eye size={20} /> : <EyeClosed size={20} />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
