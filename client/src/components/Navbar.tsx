import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/home', icon: <HomeIcon /> },
    { label: 'Reminders', path: '/add-reminder', icon: <NotificationsIcon /> },
    { label: 'Schedules', path: '/add-schedule', icon: <ScheduleIcon /> },
    { label: 'Patients', path: '/add-patient', icon: <PersonIcon /> },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          DementiAid
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              sx={{
                borderColor:
                  location.pathname === item.path ? 'white' : 'transparent',
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
