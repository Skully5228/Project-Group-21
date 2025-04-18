import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rxdfrrfdaweiosovpala.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4ZGZycmZkYXdlaW9zb3ZwYWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NTgyNTQsImV4cCI6MjA1OTEzNDI1NH0.c8gGtwSx0rnmjAAAsNzfPfqSonZKLni7sgYR9HMLOZQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { supabase };
