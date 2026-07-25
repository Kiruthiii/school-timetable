import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://vomxmkndtvienodtpogo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbXhta25kdHZpZW5vZHRwb2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MDkzMDIsImV4cCI6MjA5NzE4NTMwMn0.bBnXUdOax_f6eOUszsadnKIZHKm4llzv5WbipEmkgQM";
export const supabase = createClient(supabaseUrl, supabaseKey);
