import { useEffect, useState } from 'react';
import { type User } from '@supabase/supabase-js';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventIcon from '@mui/icons-material/Event';
import { getCurrentUser } from '../lib/auth';
import api from '../lib/api';

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [patientCount, setPatientCount] = useState<number | null>(null);
  const [reminderCount, setReminderCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchAuthUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    async function fetchPatientCount() {
      const response = await api.get('/patients');
      setPatientCount(response.data.length);
    }
    async function fetchReminderCount() {
      const response = await api.get('/reminders');
      setReminderCount(response.data.length);
    }
    fetchAuthUser();
    fetchPatientCount();
    fetchReminderCount();
  }, []);

  const stats = [
    { title: 'Total Patients', value: patientCount, icon: <PeopleIcon />, color: '#1976d2' },
    { title: 'Active Reminders', value: reminderCount, icon: <NotificationsIcon />, color: '#d32f2f' },
    { title: 'Scheduled Events', value: '0', icon: <EventIcon />, color: '#388e3c' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        {user && (
          <Typography variant="body1" color="text.secondary">
            Welcome, {user.email}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    color: stat.color,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h6" component="div">
                  {stat.title}
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DashboardIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Quick Actions</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Use the navigation bar above to add reminders, schedules, or patients.
        </Typography>
      </Paper>
    </Container>
  );
}

export default Dashboard;
