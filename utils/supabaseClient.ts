import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nsltsesbthdbzpqiyodl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbHRzZXNidGhkYnpwcWl5b2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMjUwNTUsImV4cCI6MjA2MjcwMTA1NX0.VdUeaxnMVwMM9sgCxK6trbwPs4OTckHbFYF4LxXbU3E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);