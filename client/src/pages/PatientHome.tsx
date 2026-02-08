import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import api from '../lib/api';
import Chatbot from '../components/Chatbot';
import { getUserId } from '../lib/auth';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone_num?: string;
  date_of_birth?: string;
}

interface Reminder {
  id: string;
  content: string;
  frequency: string;
}

function PatientHome() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | undefined>(undefined);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  // const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatientData() {
      try {
        const patientId = await getUserId();
        if (!patientId) {
          setError('Patient not authenticated');
          setLoading(false);
          return;
        }

        const res = await api.get(`/patients/${patientId}`);
        const currentPatient: Patient = res.data;
        setPatient(currentPatient);

        // Fetch reminders for this patient
        try {
          const remindersRes = await api.get('/reminders');
          const patientReminders =
            remindersRes.data?.filter(
              (r: any) => r.patient_id === currentPatient.id,
            ) || [];
          setReminders(patientReminders);
        } catch (err) {
          console.error('Failed to load reminders:', err);
        }

        //    // Fetch all schedules (filter by patient if needed)
        // try {
        //   const schedulesRes = await api.get(`/schedules`);
        //   const patientSchedules =
        //     schedulesRes.data?.filter((s: any) => s.patient_id === patient?.id) ||
        //     [];
        //   setSchedules(patientSchedules);
        // } catch (err) {
        //   console.error('Failed to load schedules:', err);
        // }
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load patient data',
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPatientData();
  }, []);

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error || !patient) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Patient not found'}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/home')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Patient Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ mr: 2, fontSize: 32, color: '#1976d2' }} />
          <Box>
            <Typography variant="h4" component="h1">
              {patient.first_name} {patient.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient Profile
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Patient Details Card */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Patient Information</Typography>
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            size="small"
            onClick={() => navigate(`/edit-patient/${patient.id}`)}
          >
            Edit
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Full Name
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {patient.first_name} {patient.last_name}
            </Typography>
          </Box>
          {patient.date_of_birth && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Date of Birth
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {new Date(patient.date_of_birth).toLocaleDateString()}
              </Typography>
            </Box>
          )}
          {patient.phone_num && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Phone Number
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {patient.phone_num}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Reminders Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Reminders</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {reminders.length > 0 ? (
          <List>
            {reminders.map((reminder, index) => (
              <Box key={reminder.id}>
                <ListItem>
                  <ListItemText
                    primary={reminder.content}
                    secondary={`Frequency: ${reminder.frequency}`}
                  />
                </ListItem>
                {index < reminders.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No reminders set
          </Typography>
        )}
      </Paper>

      {/* Chatbot Section */}
      <Box sx={{ mb: 4 }}>
        <Chatbot patientId={patient.id} />
      </Box>

      {/* Back Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/home')}
          sx={{ minWidth: 150 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
}

export default PatientHome;
