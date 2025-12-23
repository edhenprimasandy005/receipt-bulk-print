import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export function createServerClient() {
  const cookieStore = cookies();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: false,
      storage: {
        getItem: (key: string) => {
          if (key === 'sb-access-token') {
            return cookieStore.get('sb-access-token')?.value ?? null;
          }
          if (key === 'sb-refresh-token') {
            return cookieStore.get('sb-refresh-token')?.value ?? null;
          }
          return null;
        },
        setItem: () => {}, // no-op since cookies are managed externally
        removeItem: () => {}, // no-op since cookies are managed externally
      },
    },
  });
}