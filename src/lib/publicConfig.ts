const fallbackConfig = {
  supabaseUrl: 'https://ctzonzyncnktjschpupz.supabase.co',
  supabaseAnonKey: 'sb_publishable_lx4Gzq7A6Gi0ooIqYY5BRw_iU79KbZz',
  googleClientId: '1065078894672-rmp5kp8vfjns5rn9kp5psfp16g691043.apps.googleusercontent.com',
  googleAuthProxy: 'https://designarena.ai/auth/google/callback',
};

const env = import.meta.env as Record<string, string | undefined>;

export const publicConfig = {
  supabaseUrl: env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || fallbackConfig.supabaseUrl,
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackConfig.supabaseAnonKey,
  googleClientId: env.VITE_GOOGLE_CLIENT_ID || fallbackConfig.googleClientId,
  googleAuthProxy: env.VITE_GOOGLE_AUTH_PROXY || fallbackConfig.googleAuthProxy,
};
