import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fqpizscquprqqubsaymq.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxcGl6c2NxdXBycXF1YnNheW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDY5NjUsImV4cCI6MjEwMTUyMjk2NX0.2VbuUfMTDsG-eqEisfCYDTeqKf1852uzkYKf6RwonmA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);