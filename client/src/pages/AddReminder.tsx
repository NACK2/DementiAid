import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { getUserId } from '../lib/auth';

const reminderSchema = z.object({
  content: z.string().min(1, 'Reminder content is required'),
  frequency: z.string().min(1, 'Reminder frequency is required'),
  time_of_day: z.string().min(1, 'Time of day is required'),
  start_date: z.string().min(1, 'Start date is required'),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

function AddReminder() {
  const [frequencyUnit, setFrequencyUnit] = useState<string>('');
  const [reminders, setReminders] = useState<any[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editFrequencyValue, setEditFrequencyValue] = useState('');
  const [editFrequencyUnit, setEditFrequencyUnit] = useState('');
  const [editTimeOfDay, setEditTimeOfDay] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editTouched, setEditTouched] = useState(false);

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
      time_of_day: '',
      start_date: '',
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

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await api.delete(`/reminders/${reminderId}`);
      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
      setSnackbar({
        open: true,
        message: 'Reminder deleted successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting reminder:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete reminder.',
        severity: 'error',
      });
    }
  };

  const handleStartEdit = (reminder: any) => {
    setEditingId(reminder.id);
    setEditContent(reminder.content);
    const [val, unit] = reminder.frequency.split(' ');
    setEditFrequencyValue(val);
    setEditFrequencyUnit(unit);
    setEditTimeOfDay(
      reminder.time_of_day
        ? new Date(reminder.time_of_day).toISOString().substring(11, 16)
        : ''
    );
    setEditStartDate(
      reminder.start_date ? reminder.start_date.substring(0, 10) : ''
    );
    setEditTouched(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setEditFrequencyValue('');
    setEditFrequencyUnit('');
    setEditTimeOfDay('');
    setEditStartDate('');
    setEditTouched(false);
  };

  const handleSaveEdit = async () => {
    setEditTouched(true);
    if (
      !editingId ||
      !editContent.trim() ||
      !editFrequencyValue.trim() ||
      !editFrequencyUnit ||
      !editTimeOfDay ||
      !editStartDate
    )
      return;
    try {
      const frequency = `${editFrequencyValue} ${editFrequencyUnit}`;
      const time_of_day = new Date(
        `1970-01-01T${editTimeOfDay}:00Z`
      ).toISOString();
      const start_date = new Date(editStartDate).toISOString();
      await api.put(`/reminders/${editingId}`, {
        content: editContent,
        frequency,
        time_of_day,
        start_date,
      });
      setReminders((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, content: editContent, frequency, time_of_day, start_date }
            : r
        )
      );
      setSnackbar({
        open: true,
        message: 'Reminder updated successfully!',
        severity: 'success',
      });
      handleCancelEdit();
    } catch (err) {
      console.error('Error updating reminder:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update reminder.',
        severity: 'error',
      });
    }
  };

  const onSubmit = async (data: ReminderFormData) => {
    data.frequency = data.frequency + ' ' + frequencyUnit;
    const payload = {
      content: data.content,
      frequency: data.frequency,
      time_of_day: new Date(`1970-01-01T${data.time_of_day}:00`).toISOString(),
      start_date: new Date(data.start_date).toISOString(),
    };
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

      const response = await api.post('/reminders', {
        ...payload,
        provider_id,
      });

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
                  {editingId === reminder.id ? (
                    <Box
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                      }}
                    >
                      <TextField
                        size="small"
                        label="Reminder Message"
                        required
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onBlur={() => setEditTouched(true)}
                        fullWidth
                        error={editTouched && !editContent.trim()}
                        helperText={
                          editTouched && !editContent.trim()
                            ? 'Reminder content is required'
                            : ''
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          label="Frequency"
                          required
                          value={editFrequencyValue}
                          onChange={(e) =>
                            setEditFrequencyValue(e.target.value)
                          }
                          onBlur={() => setEditTouched(true)}
                          sx={{ flex: 1 }}
                          error={editTouched && !editFrequencyValue.trim()}
                          helperText={
                            editTouched && !editFrequencyValue.trim()
                              ? 'Frequency is required'
                              : ''
                          }
                        />
                        <TextField
                          size="small"
                          select
                          required
                          label="Unit"
                          value={editFrequencyUnit}
                          onChange={(e) => setEditFrequencyUnit(e.target.value)}
                          sx={{ width: 130 }}
                          error={editTouched && !editFrequencyUnit}
                          helperText={
                            editTouched && !editFrequencyUnit ? 'Required' : ''
                          }
                        >
                          {Object.entries(frequencyMap).map(([unit, label]) => (
                            <MenuItem key={unit} value={unit}>
                              {label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          label="Time of Day"
                          type="time"
                          required
                          value={editTimeOfDay}
                          onChange={(e) => setEditTimeOfDay(e.target.value)}
                          onBlur={() => setEditTouched(true)}
                          sx={{ flex: 1 }}
                          InputLabelProps={{ shrink: true }}
                          error={editTouched && !editTimeOfDay}
                          helperText={
                            editTouched && !editTimeOfDay ? 'Required' : ''
                          }
                        />
                        <TextField
                          size="small"
                          label="Start Date"
                          type="date"
                          required
                          value={editStartDate}
                          onChange={(e) => setEditStartDate(e.target.value)}
                          onBlur={() => setEditTouched(true)}
                          sx={{ flex: 1 }}
                          InputLabelProps={{ shrink: true }}
                          error={editTouched && !editStartDate}
                          helperText={
                            editTouched && !editStartDate ? 'Required' : ''
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleSaveEdit}
                          disabled={
                            !editContent.trim() ||
                            !editFrequencyValue.trim() ||
                            !editFrequencyUnit ||
                            !editTimeOfDay ||
                            !editStartDate
                          }
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <ListItem
                      alignItems="flex-start"
                      secondaryAction={
                        <Box>
                          <IconButton
                            edge="end"
                            onClick={() => handleStartEdit(reminder)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleDeleteReminder(reminder.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={reminder.content}
                        secondary={`Every ${formatFrequency(
                          reminder.frequency
                        )}${
                          reminder.time_of_day
                            ? ` at ${new Date(
                                reminder.time_of_day
                              ).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}`
                            : ''
                        }${
                          reminder.start_date
                            ? ` · Starting ${new Date(
                                reminder.start_date
                              ).toLocaleDateString()}`
                            : ''
                        }`}
                      />
                    </ListItem>
                  )}
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="frequency"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Frequency"
                      variant="outlined"
                      required
                      sx={{ flex: 1 }}
                      error={!!errors.frequency}
                      helperText={errors.frequency?.message}
                    />
                  )}
                />
                <TextField
                  select
                  label="Unit"
                  value={frequencyUnit}
                  onChange={(e) => setFrequencyUnit(e.target.value)}
                  sx={{ width: 150 }}
                  variant="outlined"
                >
                  {Object.entries(frequencyMap).map(([unit, label]) => (
                    <MenuItem key={unit} value={unit}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Controller
                name="time_of_day"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Time of Day"
                    type="time"
                    variant="outlined"
                    required
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.time_of_day}
                    helperText={errors.time_of_day?.message}
                  />
                )}
              />

              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Start Date"
                    type="date"
                    variant="outlined"
                    required
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.start_date}
                    helperText={errors.start_date?.message}
                  />
                )}
              />

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
