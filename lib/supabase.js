import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pcoifurkduyzeegmaqjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjb2lmdXJrZHV5emVlZ21hcWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMzY0NjksImV4cCI6MjA1ODkxMjQ2OX0.8OHEie6M-gwS2YNJEvSu4sO11s4bMNWmoaQ7iW7xpeA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
