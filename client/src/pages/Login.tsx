import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { signInWithOAuth } from '../lib/auth';

async function GoogleOAuthLogin() {
  await signInWithOAuth('google', 'http://localhost:5173/home');
}

function Home() {
  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <Button variant="contained" size="large" onClick={GoogleOAuthLogin}>
        Log In
      </Button>
    </Container>
  );
}

export default Home;
