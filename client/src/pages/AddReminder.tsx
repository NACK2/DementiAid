import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  InputAdornment,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import api from '../lib/api';

const reminderSchema = z.object({
  content: z.string().min(1, 'Reminder content is required'),
  frequency: z.string().min(1, 'Reminder frequency is required'),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

function AddReminder() {
  const [frequencyUnit, setFrequencyUnit] = useState<string>('');
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      content: '',
      frequency: '',
    },
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const frequencyMap: Record<string, string> = {
    'Hour(s)': 'h',
    'Day(s)': 'd',
    'Week(s)': 'w',
    'Month(s)': 'm',
    'Year(s)': 'y',
  }
  const formatFrequency = (count: string, unit: string) => {
    return `${count}${frequencyMap[unit]}`;
  }

  const onSubmit = async (data: ReminderFormData) => {
    data.frequency = formatFrequency(data.frequency, frequencyUnit);
    console.log('Reminder data:', data);
    try {
        console.log(data);
      const response = await api.post('/reminders', data);
      
      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: 'Reminder template created successfully!',
          severity: 'success',
        });
        reset();
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to add patient. Please try again.',
        severity: 'error',
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AddAlertIcon sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Add Reminder
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Create a recurring reminder for a patient
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Reminder Message"
                  required
                  variant="outlined"
                  error={!!errors.content}
                  helperText={errors.content?.message}
                />
              )}
            />
            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Reminder Frequency"
                  variant="outlined"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <TextField
                            select
                          value={frequencyUnit}
                          onChange={(e) => {
                            setFrequencyUnit(e.target.value);
                          }}
                          variant="standard"
                          sx={{
                            width: "160px",
                          }}
                        >
                          {Object.entries(frequencyMap).map(([unit, value]) => (
                            <MenuItem key={unit} value={value}>
                              {unit}
                            </MenuItem>
                          ))}
                        </TextField>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || !isValid || !frequencyUnit}>
                {isSubmitting ? 'Creating...' : 'Create Reminder'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
            <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AddReminder;

