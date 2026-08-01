export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

export function getSupabaseConfig() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Copy .env.example to .env.local and fill in your Supabase credentials.'
    );
  }
  return supabaseConfig;
}
