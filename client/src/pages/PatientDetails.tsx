import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { getUserId } from '../lib/auth';

const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  phone_num: z.string().optional(),
  date_of_birth: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface ReminderSetting {
  id: string;
  content: string;
  frequency: string;
  time_of_day?: string;
  provider_id?: string;
}

function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Reminder settings state
  const [assignedReminders, setAssignedReminders] = useState<ReminderSetting[]>(
    []
  );
  const [availableReminders, setAvailableReminders] = useState<
    ReminderSetting[]
  >([]);
  const [selectedReminderId, setSelectedReminderId] = useState('');
  const [remindersLoading, setRemindersLoading] = useState(true);

  const frequencyMap: Record<string, string> = {
    h: 'Hour(s)',
    d: 'Day(s)',
    w: 'Week(s)',
    m: 'Month(s)',
    y: 'Year(s)',
  };

  const formatFrequency = (freq: string) => {
    if (!freq) return freq;
    const [value, unit] = freq.split(' ');
    return `${value} ${frequencyMap[unit] || unit}`;
  };

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_num: '',
      date_of_birth: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/patients/${patientId}`);
        const patient = res.data;
        reset({
          first_name: patient.first_name || '',
          last_name: patient.last_name || '',
          phone_num: patient.phone_num || '',
          date_of_birth: patient.date_of_birth
            ? patient.date_of_birth.substring(0, 10)
            : '',
        });
      } catch (err) {
        console.error('Failed to fetch patient', err);
        setSnackbar({
          open: true,
          message: 'Failed to load patient details.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId, reset]);

  // Fetch assigned reminder settings for the patient & available reminders for the provider
  const fetchReminders = useCallback(async () => {
    if (!patientId) return;
    try {
      setRemindersLoading(true);
      const [assignedRes, providerId] = await Promise.all([
        api.get(`/patients/${patientId}/reminder-settings`),
        getUserId(),
      ]);
      setAssignedReminders(assignedRes.data);

      if (providerId) {
        const availableRes = await api.get(
          `/providers/${providerId}/reminders`
        );
        setAvailableReminders(availableRes.data);
      }
    } catch (err) {
      console.error('Failed to load reminder settings', err);
    } finally {
      setRemindersLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleAssignReminder = async () => {
    if (!selectedReminderId || !patientId) return;
    try {
      await api.post(`/patients/${patientId}/reminder-settings`, {
        reminder_settings_id: selectedReminderId,
      });
      setSnackbar({
        open: true,
        message: 'Reminder assigned successfully!',
        severity: 'success',
      });
      setSelectedReminderId('');
      fetchReminders();
    } catch (err) {
      console.error('Error assigning reminder:', err);
      setSnackbar({
        open: true,
        message: 'Failed to assign reminder.',
        severity: 'error',
      });
    }
  };

  const handleRemoveReminder = async (reminderSettingsId: string) => {
    if (!patientId) return;
    try {
      await api.delete(
        `/patients/${patientId}/reminder-settings/${reminderSettingsId}`
      );
      setSnackbar({
        open: true,
        message: 'Reminder removed successfully!',
        severity: 'success',
      });
      fetchReminders();
    } catch (err) {
      console.error('Error removing reminder:', err);
      setSnackbar({
        open: true,
        message: 'Failed to remove reminder.',
        severity: 'error',
      });
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      const response = await api.put(`/patients/${patientId}`, data);

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Patient updated successfully!',
          severity: 'success',
        });
        reset(data);
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update patient. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4">Patient Details</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          View and update patient information
        </Typography>
      </Box>

      {/* Edit Patient Form */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                    required
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                  />
                )}
              />

              <Controller
                name="last_name"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Last Name" />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Controller
                name="phone_num"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Phone" type="tel" />
                )}
              />

              <Controller
                name="date_of_birth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!isValid || isSubmitting || !isDirty}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Assigned Reminder Settings */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Reminder Settings
        </Typography>

        {/* Assign new reminder */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 300 }} size="small">
            <InputLabel>Select a reminder to assign</InputLabel>
            <Select
              value={selectedReminderId}
              label="Select a reminder to assign"
              onChange={(e) => setSelectedReminderId(e.target.value)}
            >
              {availableReminders
                .filter((r) => !assignedReminders.some((ar) => ar.id === r.id))
                .map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.content} — {formatFrequency(r.frequency)}{r.time_of_day ? ` at ${new Date(r.time_of_day).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleAssignReminder}
            disabled={!selectedReminderId}
          >
            Assign
          </Button>
        </Box>

        {remindersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : assignedReminders.length === 0 ? (
          <Typography color="text.secondary">
            No reminder settings assigned to this patient.
          </Typography>
        ) : (
          <List disablePadding>
            {assignedReminders.map((r, idx) => (
              <Box key={r.id}>
                {idx > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleRemoveReminder(r.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={r.content}
                    secondary={`Frequency: ${formatFrequency(r.frequency)}${r.time_of_day ? ` · At ${new Date(r.time_of_day).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default PatientDetails;
