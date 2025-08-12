import { TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { SignupFormData } from '@/app/signup/components/SignupForm';

export default function NameField({ disabled }: { disabled?: boolean }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormData>();
  return (
    <TextField
      label="Name"
      type="text"
      fullWidth
      disabled={disabled}
      autoFocus
      {...register('name', {
        required: 'Name is required',
        minLength: { value: 3, message: 'Name must be at least 3 characters' },
      })}
      error={!!errors.name}
      helperText={errors.name?.message}
    />
  );
}