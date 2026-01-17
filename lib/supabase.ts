import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (only works server-side)
export const supabaseAdmin: SupabaseClient | null = typeof window === 'undefined'
  ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null; // Client-side fallback - don't use supabaseAdmin in client components!

// Database types
export type User = {
  id: string;
  phone_number: string;
  email?: string;
  full_name: string;
  preferred_language: string;
  is_verified: boolean;
  kyc_status: 'pending' | 'verified' | 'rejected';
  credit_score?: number;
  soft_credit_score?: number;
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  transaction_type: 'send' | 'receive' | 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  beneficiary_id?: string;
  beneficiary_name?: string;
  status: 'pending' | 'completed' | 'failed' | 'flagged';
  payment_method: string;
  description?: string;
  metadata?: Record<string, unknown>;
  risk_score?: number;
  fraud_check_passed: boolean;
  completed_at?: string;
  created_at: string;
};

export type Beneficiary = {
  id: string;
  user_id: string;
  name: string;
  phone_number?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  photo_url?: string;
  nickname?: string;
  is_verified: boolean;
  added_via: 'voice' | 'manual' | 'photo';
  created_at: string;
  updated_at: string;
};

export type Circular = {
  id: string;
  title: string;
  source?: string;
  source_url?: string;
  raw_text: string;
  language: string;
  category?: string;
  published_date?: string;
  fetched_at: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type FormTemplate = {
  id: string;
  name: string;
  category?: string;
  description?: string;
  fields: Array<Record<string, unknown>>;
  language_support: string[];
  validation_rules?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type FormSession = {
  id: string;
  user_id: string;
  template_id: string;
  current_field_index: number;
  answers: Record<string, unknown>;
  language: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  completed_at?: string;
  created_at: string;
  updated_at: string;
};
