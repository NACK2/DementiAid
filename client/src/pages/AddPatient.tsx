import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  phone_num: z.string().optional(),
  date_of_birth: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

function AddPatient() {
  const navigate = useNavigate();
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
    mode: 'onChange', // Enable validation on change
  });

  const onSubmit = async (data: PatientFormData) => {
    try {
        console.log('patient data', data);
      const response = await api.post('/patients', data);
      
      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: 'Patient added successfully!',
          severity: 'success',
        });
        reset();
        // Optionally navigate to dashboard or patient list after a short delay
        setTimeout(() => {
          navigate('/home');
        }, 1500);
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

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonAddIcon sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Add Patient
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Register a new patient in the system
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                    required
                    variant="outlined"
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
                    variant="outlined"
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                  />
                )}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
              <Controller
                name="phone_num"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone"
                    type="tel"
                    variant="outlined"
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
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                  />
                )}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? 'Adding...' : 'Add Patient'}
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

export default AddPatient;

