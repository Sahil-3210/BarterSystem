import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://poolbnptipxfhapovdin.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb2xibnB0aXB4ZmhhcG92ZGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NTY0NDIsImV4cCI6MjA1OTQzMjQ0Mn0.jAlYW5lVud5Z7-3v11P4hvmvPvRhrao7En-MI_H-e04';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
