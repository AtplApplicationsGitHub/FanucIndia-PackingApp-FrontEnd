import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import Box from '@mui/material/Box';

type Props = {
  value: string;
  onChange: (field: string, value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
};

const DeliveryDatePicker: React.FC<Props> = ({
  value,
  onChange,
  error,
  required = true,
  disabled,
}) => {
  const today  = React.useMemo(() => dayjs().startOf('day'), []);
  const maxDate = React.useMemo(() => dayjs().add(50, 'year').endOf('day'), []);
  const dateValue: Dayjs | null = value ? dayjs(value) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%' }}>
        <DesktopDatePicker
          label="Required Date of Delivery"
          value={dateValue}
          onChange={(newDate) => {
            const dateString =
              newDate && dayjs.isDayjs(newDate) && newDate.isValid()
                ? newDate.format('YYYY-MM-DD') 
                : '';
            onChange('deliveryDate', dateString);
          }}
          minDate={today}
          maxDate={maxDate}
          disablePast
          disabled={disabled}
          slotProps={{
            field: {
              clearable: true,
              onClear: () => onChange('deliveryDate', ''),
            },
            textField: {
              required,
              error: !!error,
              helperText: error,
              size: 'medium',
              autoComplete: 'off',
              InputLabelProps: { required },
              fullWidth: true,
              sx: {
                mb: 1,
                width: '100%',
                '& .MuiInputBase-root': {
                  borderRadius: '4px', 
                  backgroundColor: (theme) => theme.palette.background.paper,
                },
                '& .MuiInputLabel-root': { fontWeight: 500, fontSize: 15 },
                '& .MuiFormLabel-asterisk': { color: '#dc2626' },
              },
            },
          }}
          format="DD-MMM-YYYY"
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              borderRadius: '0.5rem',
              backgroundColor: (theme) => theme.palette.background.paper,
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DeliveryDatePicker;