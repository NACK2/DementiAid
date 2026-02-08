import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Snackbar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { getUserId } from '../lib/auth';

const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  phone_num: z.string().optional(),
  date_of_birth: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

type Patient = {
  id: string;
  first_name: string;
  last_name?: string;
  phone_num?: string;
  date_of_birth?: string;
};

function AddPatient() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [userId, setUserId] = useState('');

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
    formState: { errors, isSubmitting, isValid },
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

  const fetchPatients = async () => {
    const providerId = await getUserId();
    try {
      setLoadingPatients(true);
      const res = await api.get(`/providers/${providerId}/patients`);
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
        console.log(patients);
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const onSubmit = async (data: PatientFormData) => {
    try {
        const providerId = await getUserId();
      const response = await api.post('/patients', data);
      const patientId = response.data.patient_id;
      await api.post('patients-providers', { patient_id: patientId, provider_id: providerId, patient_authorized: false })
      console.log(response);

      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: 'Patient added successfully!',
          severity: 'success',
        });
        reset();
        fetchPatients();
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to add patient. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonAddIcon sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4">Add Patient</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Register a new patient and view your existing patients
        </Typography>
      </Box>

      {/* Add Patient Form */}
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
                  <TextField
                    {...field}
                    fullWidth
                    label="Last Name"
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Controller
                name="phone_num"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone"
                    type="tel"
                  />
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
              <Button variant="outlined" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Patient'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Patients List */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your Patients
        </Typography>

        {loadingPatients ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : patients.length === 0 ? (
          <Typography color="text.secondary">
            No patients yet.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Date of Birth</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.first_name}</TableCell>
                  <TableCell>{p.last_name || '—'}</TableCell>
                  <TableCell>{p.phone_num || '—'}</TableCell>
                  <TableCell>
                    {p.date_of_birth
                      ? new Date(p.date_of_birth).toLocaleDateString()
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

export default AddPatient;
