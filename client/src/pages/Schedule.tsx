import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import api from '../lib/api';

interface ScheduleItem {
  id: number;
  content: string;
  frequency: string;
  patient_name: string | null;
  sent_today: boolean;
}

function Schedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await api.get('/todays-schedule');
        setSchedule(response.data);
      } catch (err) {
        setError('Failed to load schedule');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Today's Schedule
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {today}
        </Typography>
      </Box>

      {loading && <Typography>Loading schedule...</Typography>}

      {error && (
        <Typography color="error">{error}</Typography>
      )}

      {!loading && !error && schedule.length === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            No reminders scheduled for today.
          </Typography>
        </Paper>
      )}

      {!loading && !error && schedule.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Patient</strong></TableCell>
                <TableCell><strong>Reminder</strong></TableCell>
                <TableCell><strong>Frequency</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedule.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.patient_name || '—'}</TableCell>
                  <TableCell>{item.content}</TableCell>
                  <TableCell>{item.frequency}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.sent_today ? 'Sent' : 'Pending'}
                      color={item.sent_today ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default Schedule;
