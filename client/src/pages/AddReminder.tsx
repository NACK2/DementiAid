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
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { getUserId } from '../lib/auth';

const reminderSchema = z.object({
  content: z.string().min(1, 'Reminder content is required'),
  frequency: z.string().min(1, 'Reminder frequency is required'),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

function AddReminder() {
  const [frequencyUnit, setFrequencyUnit] = useState<string>('');
  const [reminders, setReminders] = useState<any[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [showUnitSelect, setShowUnitSelect] = useState(false);

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
    h: 'Hour(s)',
    d: 'Day(s)',
    w: 'Week(s)',
    m: 'Month(s)',
    y: 'Year(s)',
  };

  const formatFrequency = (key: string) => {
    const frequencyKey = key.split(' ')[0];
    const frequencyUnit = key.split(' ')[1];
    return frequencyKey + ' ' + frequencyMap[frequencyUnit];
  };

  useEffect(() => {
    async function loadReminders() {
      const providerId = await getUserId();
      if (!providerId) return;
      try {
        const res = await api.get(`/providers/${providerId}/reminders`);
        setReminders(res.data);
      } catch (err) {
        console.error('Failed to load reminders', err);
      } finally {
        setLoadingReminders(false);
      }
    }
    loadReminders();
  }, []);

  const onSubmit = async (data: ReminderFormData) => {
    data.frequency = data.frequency + ' ' + frequencyUnit;
    try {
      const provider_id = await getUserId();
      if (!provider_id) {
        setSnackbar({
          open: true,
          message: 'You must be logged in to create a reminder.',
          severity: 'error',
        });
        return;
      }

      const response = await api.post('/reminders', { ...data, provider_id });

      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: 'Reminder template created successfully!',
          severity: 'success',
        });
        reset();
        setFrequencyUnit('');

        // refresh list
        const res = await api.get(`/providers/${provider_id}/reminders`);
        setReminders(res.data);
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to add reminder. Please try again.',
        severity: 'error',
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Manage Reminders
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' },
          gap: 4,
        }}
      >
        {/* LEFT COLUMN: Existing reminders */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Existing Reminders
          </Typography>
          {loadingReminders ? (
            <Typography color="text.secondary">Loading…</Typography>
          ) : reminders.length === 0 ? (
            <Typography color="text.secondary">No reminders yet</Typography>
          ) : (
            <List>
              {reminders.map((reminder, idx) => (
                <Box key={reminder.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={reminder.content}
                      secondary={`Every ${formatFrequency(reminder.frequency)}`}
                    />
                  </ListItem>
                  {idx < reminders.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Paper>

        {/* RIGHT COLUMN: Add reminder form */}
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AddAlertIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Add New Reminder</Typography>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 3,
                }}
              >
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
                      onFocus={() => setShowUnitSelect(true)}
                      onBlur={() => setShowUnitSelect(false)}
                      InputProps={{
                        endAdornment: showUnitSelect ? (
                          <InputAdornment position="end">
                            <TextField
                              select
                              value={frequencyUnit}
                              onFocus={() => setShowUnitSelect(true)}
                              onChange={(e) => setFrequencyUnit(e.target.value)}
                              variant="standard"
                              sx={{ width: '100px' }}
                            >
                              {Object.entries(frequencyMap).map(
                                ([unit, value]) => (
                                  <MenuItem key={value} value={unit}>
                                    {value}
                                  </MenuItem>
                                )
                              )}
                            </TextField>
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  )}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || !isValid || !frequencyUnit}
                >
                  {isSubmitting ? 'Creating...' : 'Create Reminder'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>

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
