import { useEffect, useState } from 'react';
import { createClient, type User } from '@supabase/supabase-js';
import Container from '@mui/material/Container';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchAuthUser() {
      const { data } = await supabase.auth.getUser();
      //   console.log('auth user data:', data)
      setUser(data?.user ?? null);
    }
    fetchAuthUser();
  }, []);

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
      {user ? <p>Signed in as: {user.email}</p> : <p>No user signed in.</p>}
    </Container>
  );
}

export default Home;
