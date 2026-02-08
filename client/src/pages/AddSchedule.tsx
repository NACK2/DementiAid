import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const scheduleSchema = z.object({
  title: z.string().min(1, 'Schedule title is required'),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  patient: z.string().min(1, 'Patient is required'),
  frequency: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

function AddSchedule() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      patient: '',
      frequency: '',
    },
  });

  const onSubmit = async (data: ScheduleFormData) => {
    // TODO: Implement schedule creation logic
    console.log('Schedule data:', data);
    alert('Schedule creation functionality to be implemented');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ScheduleIcon sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Add Schedule
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Create a new schedule for a patient
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Schedule Title"
                  required
                  variant="outlined"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  variant="outlined"
                />
              )}
            />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Start Time"
                    type="datetime-local"
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                    error={!!errors.startTime}
                    helperText={errors.startTime?.message}
                  />
                )}
              />
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="End Time"
                    type="datetime-local"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                  />
                )}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
              <Controller
                name="patient"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Patient"
                    required
                    variant="outlined"
                    error={!!errors.patient}
                    helperText={errors.patient?.message}
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
                    label="Frequency"
                    placeholder="e.g., Daily, Weekly, Monthly"
                    variant="outlined"
                  />
                )}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Schedule'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default AddSchedule;

