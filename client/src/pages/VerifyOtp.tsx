import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { supabase } from '../lib/supabase';

function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fill phone from query string if redirected after invite, e.g. /verify-otp?phone=+15551234567
  const [phone, setPhone] = useState(searchParams.get('phone') ?? '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    navigate('/patients');
  }

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <LockOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" component="h1">
            Verify Your Phone
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            Enter the 6-digit code sent to your phone number.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleVerify} noValidate>
          <TextField
            label="Phone Number"
            placeholder="+11234567890"
            fullWidth
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="One-Time Password"
            placeholder="123456"
            fullWidth
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputProps={{ maxLength: 6, inputMode: 'numeric' }}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !phone || !otp}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : 'Verify'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default VerifyOtp;
