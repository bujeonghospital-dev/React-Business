import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create Supabase client for server-side use (API routes, Server Components)
function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not found in environment variables");
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Export server-side client
export const supabaseServer = createServerSupabaseClient();
