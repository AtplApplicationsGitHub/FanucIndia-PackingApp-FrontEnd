import {
  TextField,
  InputAdornment,
  Typography,
} from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API } from "@/common/lib/api";
import { SignupFormData } from '@/app/signup/components/SignupForm';

export default function EmailField({ disabled }: { disabled?: boolean }) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SignupFormData>();
  const email = watch('email') || '';
  const [emailStatus, setEmailStatus] = useState<null | 'checking' | 'available' | 'exists' | 'error'>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailStatus(null);
      return;
    }
    setEmailStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(API.AUTH.CHECK_EMAIL(email));
        setEmailStatus(res.data.exists ? 'exists' : 'available');
      } catch {
        setEmailStatus('error');
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [email]);

  const helper = 
    errors.email?.message ||
    (emailStatus === 'exists'   ? 'Email already exists'   :
     emailStatus === 'error'    ? 'Could not validate email': '');

  return (
    <>
      <TextField
        label="Email"
        type="email"
        fullWidth
        disabled={disabled}
        {...register('email', { required: 'Email is required' })}
        error={ Boolean(errors.email) || emailStatus === 'exists' || emailStatus === 'error' }
        helperText={helper}
        slotProps={{
          input: {
            endAdornment: email && (
              <InputAdornment position="end">
                {emailStatus === 'checking' && <Loader2 size={18} className="animate-spin text-gray-400" />}
                {emailStatus === 'available' && <CheckCircle size={18} className="text-green-600" />}
                {emailStatus === 'exists' && <XCircle size={18} className="text-red-600" />}
                {emailStatus === 'error' && <XCircle size={18} className="text-orange-500" />}
              </InputAdornment>
            ),
          },
        }}
      />
      {emailStatus === 'error' && (
        <Typography color="warning.main" variant="body2">
          Could not validate email
        </Typography>
      )}
    </>
  );
}
