// Supabase Configuration
const SUPABASE_URL = "https://gttpaztyxxfuumzbsjwb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dHBhenR5eHhmdXVtemJzandiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MzMzMzEsImV4cCI6MjA3NDEwOTMzMX0.USVvfGTqiLahxjsgBLGeRElk067WATMm6Ruy_ZrJHeQ";

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
window.supabaseClient = supabase;
