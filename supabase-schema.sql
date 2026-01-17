-- ADAPT Banking Platform - Supabase Schema
-- Database setup for Agriculture 5.0 Digital Banking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Vector extension for RAG (embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  full_name TEXT NOT NULL,
  preferred_language TEXT DEFAULT 'hi', -- Hindi default
  is_verified BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  credit_score NUMERIC,
  soft_credit_score NUMERIC,
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- KYC & VERIFICATION
-- =============================================

CREATE TABLE kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  id_type TEXT NOT NULL, -- 'Aadhaar', 'PAN', 'VoterID'
  id_hash TEXT NOT NULL, -- Hashed ID for privacy
  id_last_4 TEXT, -- Last 4 digits for display
  document_url TEXT, -- Firebase Storage URL
  status TEXT DEFAULT 'pending', -- pending, verified, rejected, manual_review
  verified_at TIMESTAMPTZ,
  provider_response JSONB,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own KYC"
  ON kyc_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- FRAUD DETECTION
-- =============================================

CREATE TABLE fraud_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- duplicate_id, suspicious_transaction, geo_mismatch, velocity_check
  details JSONB NOT NULL,
  risk_score NUMERIC NOT NULL, -- 0.0 to 1.0
  action_taken TEXT, -- flagged, blocked, manual_review
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fraud_events_user_id ON fraud_events(user_id);
CREATE INDEX idx_fraud_events_risk_score ON fraud_events(risk_score DESC);
CREATE INDEX idx_fraud_events_created_at ON fraud_events(created_at DESC);

ALTER TABLE fraud_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view fraud events
CREATE POLICY "Admin can view fraud events"
  ON fraud_events FOR SELECT
  USING (false); -- Implement proper admin check

-- =============================================
-- TRANSACTIONS & BENEFICIARIES
-- =============================================

CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  upi_id TEXT,
  photo_url TEXT, -- Visual confirmation
  nickname TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  added_via TEXT, -- voice, manual, photo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own beneficiaries"
  ON beneficiaries FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- send, receive, deposit, withdrawal
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  beneficiary_id UUID REFERENCES beneficiaries(id),
  beneficiary_name TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed, flagged
  payment_method TEXT, -- upi, bank_transfer, card
  description TEXT,
  metadata JSONB,
  risk_score NUMERIC,
  fraud_check_passed BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- GOVERNMENT CIRCULARS & RAG
-- =============================================

CREATE TABLE circulars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  source TEXT, -- RBI, NABARD, Ministry, etc.
  source_url TEXT,
  raw_text TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  category TEXT, -- loan, subsidy, scheme, regulation
  published_date DATE,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  embedding vector(1536), -- OpenAI ada-002 embedding dimension
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_circulars_category ON circulars(category);
CREATE INDEX idx_circulars_language ON circulars(language);
CREATE INDEX idx_circulars_published_date ON circulars(published_date DESC);

-- Vector similarity search index
CREATE INDEX idx_circulars_embedding ON circulars USING ivfflat (embedding vector_cosine_ops);

-- Public read access for circulars
ALTER TABLE circulars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read circulars"
  ON circulars FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- FORM TEMPLATES & SESSIONS
-- =============================================

CREATE TABLE form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT, -- loan_application, kyc, subsidy, insurance
  description TEXT,
  fields JSONB NOT NULL, -- Array of field definitions
  language_support TEXT[] DEFAULT ARRAY['hi', 'en', 'ta', 'te', 'bn'],
  validation_rules JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE form_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES form_templates(id),
  current_field_index INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}',
  language TEXT DEFAULT 'hi',
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, abandoned
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE form_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own form sessions"
  ON form_sessions FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- NON-FINANCIAL DATA (Alternative Credit)
-- =============================================

CREATE TABLE user_nonfinancial_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- agri_input, mobile_recharge, utility_bill, govt_subsidy
  category TEXT,
  amount NUMERIC,
  vendor_name TEXT,
  receipt_url TEXT, -- Firebase Storage
  extracted_data JSONB, -- OCR results
  verified BOOLEAN DEFAULT FALSE,
  event_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nonfinancial_user_id ON user_nonfinancial_events(user_id);
CREATE INDEX idx_nonfinancial_event_type ON user_nonfinancial_events(event_type);

ALTER TABLE user_nonfinancial_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own non-financial events"
  ON user_nonfinancial_events FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- CREDIT PROFILE & INSIGHTS
-- =============================================

CREATE TABLE credit_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  soft_score NUMERIC, -- 0-1000
  confidence_level NUMERIC, -- 0.0-1.0
  factors JSONB, -- Array of contributing factors
  improvement_steps JSONB, -- Actionable steps in user's language
  last_calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE credit_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit profile"
  ON credit_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- FINANCIAL INSIGHTS
-- =============================================

CREATE TABLE spending_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- daily, weekly, monthly
  total_income NUMERIC DEFAULT 0,
  total_expenses NUMERIC DEFAULT 0,
  category_breakdown JSONB, -- {food: 1000, transport: 500, ...}
  suggestions JSONB, -- Personalized suggestions
  trends JSONB, -- Spending trends
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_user_id ON spending_insights(user_id);
CREATE INDEX idx_insights_period ON spending_insights(period);

ALTER TABLE spending_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON spending_insights FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- SECURITY LOGS
-- =============================================

CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- login, mfa_verify, password_change, suspicious_activity
  ip_address TEXT,
  user_agent TEXT,
  location JSONB,
  success BOOLEAN,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_created_at ON security_logs(created_at DESC);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_kyc_updated_at
  BEFORE UPDATE ON kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON beneficiaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_form_templates_updated_at
  BEFORE UPDATE ON form_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_form_sessions_updated_at
  BEFORE UPDATE ON form_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_credit_profiles_updated_at
  BEFORE UPDATE ON credit_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
