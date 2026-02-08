import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

async function GoogleOAuthLogin() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `http://localhost:5173/home`,
    },
  });
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
