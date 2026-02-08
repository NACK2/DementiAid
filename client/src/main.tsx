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
import SupabaseTest from './pages/SupabaseTest.tsx';
import Layout from './components/Layout.tsx';
import Dashboard from './pages/Home.tsx';
import AddReminder from './pages/AddReminder.tsx';
import AddSchedule from './pages/AddSchedule.tsx';
import AddPatient from './pages/AddPatient.tsx';

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
          <Route path="/supabase-test" element={<SupabaseTest />} />
          <Route element={<Layout />}>
            <Route path="/home" element={<Dashboard />} />
            <Route path="/add-reminder" element={<AddReminder />} />
            <Route path="/add-schedule" element={<AddSchedule />} />
            <Route path="/add-patient" element={<AddPatient />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
