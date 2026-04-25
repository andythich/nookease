// Shared Supabase client.
// Vite exposes env vars prefixed with VITE_ to the browser bundle.
// The anon key is designed to be public — it only grants access through
// our Row Level Security policies, which scope every read/write to the
// authenticated user's own rows.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Visible in dev console; helpful when env vars aren't wired up yet.
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth and sync will not work.');
}

export const supabase = createClient(url || '', anonKey || '');
