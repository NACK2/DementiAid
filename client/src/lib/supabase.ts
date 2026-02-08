import { createClient } from '@supabase/supabase-js';

// Create a single Supabase client instance to avoid multiple instances warning
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

