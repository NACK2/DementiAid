import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css';
import Login from './pages/Login.tsx';
import PatientsHome from './pages/PatientsHome.tsx';
import Layout from './components/Layout.tsx';
import Dashboard from './pages/Home.tsx';
import AddReminder from './pages/AddReminder.tsx';
import AddSchedule from './pages/AddSchedule.tsx';
import AddPatient from './pages/AddPatient.tsx';

import VerifyOtp from './pages/VerifyOtp.tsx';

import PatientDetails from './pages/PatientDetails.tsx';


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/patients" element={<PatientsHome />} />
          <Route element={<Layout />}>
            <Route path="/home" element={<Dashboard />} />
            <Route path="/add-reminder" element={<AddReminder />} />
            <Route path="/add-schedule" element={<AddSchedule />} />
            <Route path="/add-patient" element={<AddPatient />} />
            <Route path="/patients/:patientId" element={<PatientDetails />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
