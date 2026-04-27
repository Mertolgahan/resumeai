import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

export const isSupabaseConfigured = !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      isSupabaseConfigured ? env.SUPABASE_URL : "https://placeholder.supabase.co",
      isSupabaseConfigured ? env.SUPABASE_ANON_KEY : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM4MzEyMDAsImV4cCI6MTk5OTQzMDgwMH0.placeholder"
    );
  }
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      isSupabaseConfigured ? env.SUPABASE_URL : "https://placeholder.supabase.co",
      isSupabaseConfigured ? env.SUPABASE_SERVICE_ROLE_KEY : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MzgzMTIwMCwiZXhwIjoxOTk5NDMwODAwfQ.placeholder"
    );
  }
  return _supabaseAdmin;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  stripe_customer_id: string | null;
  subscription_id: string | null;
  subscription_status: "free" | "active" | "canceled" | "past_due" | null;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiUsage {
  id: string;
  user_id: string;
  endpoint: string;
  model: string | null;
  tokens_input: number;
  tokens_output: number;
  provider: string;
  created_at: string;
}

export interface AiGeneration {
  id: string;
  user_id: string;
  project_id: string | null;
  type: string;
  prompt: string;
  result: string;
  model: string;
  provider: string;
  tokens_input: number;
  tokens_output: number;
  created_at: string;
}