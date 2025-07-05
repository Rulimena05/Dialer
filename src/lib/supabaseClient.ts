import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add debug logging to verify environment variables
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'vite-react',
    },
  },
  db: {
    schema: 'public',
  },
});

// Improved connection check with better error handling and retries
export const checkSupabaseConnection = async (retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting to connect to Supabase (attempt ${attempt}/${retries})...`);
      
      const { data, error } = await supabase
        .from('call_reports')
        .select('id')
        .limit(1)
        .timeout(5000); // Add timeout to prevent hanging

      if (error) {
        console.error(`Connection attempt ${attempt} failed:`, error);
        throw error;
      }

      console.log('Supabase connection successful');
      return true;
    } catch (error) {
      console.error(`Connection attempt ${attempt} failed:`, error);
      
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Failed to fetch')) {
          console.error('Network error: Unable to reach Supabase. Please check your internet connection and Supabase URL.');
        } else if (error.message.includes('timeout')) {
          console.error('Connection timeout: Supabase server is taking too long to respond.');
        }
      }

      // If we haven't tried all attempts yet, wait before retrying
      if (attempt < retries) {
        console.log(`Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('All connection attempts failed');
        return false;
      }
    }
  }
  return false;
};