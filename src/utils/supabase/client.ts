import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create Supabase client (with validation) - for client-side use only
function getSupabaseClient() {
  if (typeof window === "undefined") {
    // Server-side: return null
    return null;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not found in environment variables");
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Export a getter function instead of the client directly
export const supabase = getSupabaseClient();

// Database Types
export interface CustomerContact {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  status: "outgoing" | "received" | "waiting" | "sale";
  last_contact: string;
  notes: string;
  created_at: string;
  updated_at?: string;
}
