import { createClient } from '@supabase/supabase-js';
import { publicConfig } from './publicConfig';

const supabase = createClient(
  publicConfig.supabaseUrl,
  publicConfig.supabaseAnonKey
);

export default supabase;
