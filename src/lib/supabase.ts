import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvzandbzgyiobaaulpzh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2emFuZGJ6Z3lpb2JhYXVscHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTI1MTEsImV4cCI6MjA2MTA2ODUxMX0.hA8q14XYmIjASsPur6jMxuRlVERikRoNyzWdMh1O-1A';

export const supabase = createClient(supabaseUrl, supabaseKey); 