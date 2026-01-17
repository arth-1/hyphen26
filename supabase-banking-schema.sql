-- ADAPT Banking AI Automation Schema Extensions
-- Supabase SQL - Deploy after existing schema

-- =============================================
-- BANKING ACCOUNTS
-- =============================================

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL, -- savings, current, salary
  account_number TEXT UNIQUE NOT NULL, -- Format: ADAPT + 12 digits
  ifsc_code TEXT DEFAULT 'ADAPT0001',
  balance NUMERIC(15,2) DEFAULT 0,
  monthly_income NUMERIC(15,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);

-- =============================================
-- FIXED DEPOSITS
-- =============================================

CREATE TABLE fixed_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  principal_amount NUMERIC(15,2) NOT NULL,
  interest_rate NUMERIC(5,2) NOT NULL, -- Annual rate %
  tenure_days INTEGER NOT NULL,
  maturity_amount NUMERIC(15,2) NOT NULL,
  interest_earned NUMERIC(15,2) GENERATED ALWAYS AS 
    (maturity_amount - principal_amount) STORED,
  
  status TEXT DEFAULT 'active', -- active, matured, broken, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  maturity_date TIMESTAMPTZ NOT NULL,
  broken_at TIMESTAMPTZ,
  closure_reason TEXT,
  
  -- AI Agent Tracking
  created_via_agent BOOLEAN DEFAULT FALSE,
  agent_conversation_id TEXT, -- Link to chat history
  agent_metadata JSONB, -- Store agent reasoning, parameters
  
  -- Additional Details
  tax_treatment TEXT, -- tax_saving, regular
  penalty_on_break NUMERIC(5,2) DEFAULT 1.0, -- % reduction
  renewal_preference TEXT, -- auto, manual, matured
  
  metadata JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fixed_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own FDs"
  ON fixed_deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own FDs"
  ON fixed_deposits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_fixed_deposits_user_id ON fixed_deposits(user_id);
CREATE INDEX idx_fixed_deposits_status ON fixed_deposits(status);
CREATE INDEX idx_fixed_deposits_maturity_date ON fixed_deposits(maturity_date);
CREATE INDEX idx_fixed_deposits_created_via_agent ON fixed_deposits(created_via_agent);

-- =============================================
-- RECURRING DEPOSITS (RD)
-- =============================================

CREATE TABLE recurring_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  monthly_amount NUMERIC(15,2) NOT NULL,
  interest_rate NUMERIC(5,2) NOT NULL,
  tenure_months INTEGER NOT NULL,
  months_completed INTEGER DEFAULT 0,
  total_invested NUMERIC(15,2) GENERATED ALWAYS AS 
    (monthly_amount * months_completed) STORED,
  maturity_amount NUMERIC(15,2),
  
  status TEXT DEFAULT 'active', -- active, matured, paused, closed
  start_date TIMESTAMPTZ DEFAULT NOW(),
  maturity_date TIMESTAMPTZ NOT NULL,
  next_payment_date TIMESTAMPTZ,
  last_payment_date TIMESTAMPTZ,
  
  auto_debit_enabled BOOLEAN DEFAULT TRUE,
  auto_debit_day INTEGER DEFAULT 1, -- Day of month
  
  created_via_agent BOOLEAN DEFAULT FALSE,
  agent_conversation_id TEXT,
  agent_metadata JSONB,
  
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recurring_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own RDs"
  ON recurring_deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own RDs"
  ON recurring_deposits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_recurring_deposits_user_id ON recurring_deposits(user_id);
CREATE INDEX idx_recurring_deposits_status ON recurring_deposits(status);
CREATE INDEX idx_recurring_deposits_maturity_date ON recurring_deposits(maturity_date);

-- =============================================
-- LOANS
-- =============================================

CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  loan_type TEXT NOT NULL, -- personal, auto, home, education, business
  amount_requested NUMERIC(15,2) NOT NULL,
  amount_approved NUMERIC(15,2),
  interest_rate NUMERIC(5,2),
  tenure_months INTEGER,
  monthly_emi NUMERIC(15,2),
  total_interest NUMERIC(15,2),
  
  status TEXT DEFAULT 'applied', 
  -- applied, under_review, approved, rejected, disbursed, active, closed, prepaid
  
  reason TEXT NOT NULL,
  employment_type TEXT, -- salaried, self_employed, farmer, business
  annual_income NUMERIC(15,2),
  
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  expected_closure_date TIMESTAMPTZ,
  
  created_via_agent BOOLEAN DEFAULT FALSE,
  agent_conversation_id TEXT,
  agent_metadata JSONB,
  
  -- Agent Auto-Approval
  auto_approved BOOLEAN DEFAULT FALSE,
  auto_approval_reason TEXT,
  
  metadata JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loans"
  ON loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own loans"
  ON loans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_created_via_agent ON loans(created_via_agent);

-- =============================================
-- LOAN DOCUMENTS TRACKING
-- =============================================

CREATE TABLE loan_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- income_proof, kyc, address_proof, etc.
  document_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, uploaded, verified, rejected
  uploaded_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE loan_documents ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_loan_documents_loan_id ON loan_documents(loan_id);

-- =============================================
-- INVESTMENT PRODUCTS CATALOG
-- =============================================

CREATE TABLE investment_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL, -- fd, rd, mf, insurance, bonds, fixed_income
  description TEXT,
  
  min_amount NUMERIC(15,2),
  max_amount NUMERIC(15,2),
  current_interest_rate NUMERIC(5,2),
  min_tenure_days INTEGER,
  max_tenure_days INTEGER,
  
  risk_level TEXT, -- low, medium, high
  tax_benefit_type TEXT, -- none, elaaa, elss, etc.
  
  features JSONB, -- {
              -- "auto_renewal": true,
              -- "premature_withdrawal": true,
              -- "partial_withdrawal": false,
              -- "loan_against": false
              -- }
  
  is_active BOOLEAN DEFAULT TRUE,
  priority_score INTEGER DEFAULT 0, -- For recommendations
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investment_products_type ON investment_products(product_type);
CREATE INDEX idx_investment_products_active ON investment_products(is_active);

-- =============================================
-- AI AGENT CONVERSATIONS & AUDIT
-- =============================================

CREATE TABLE ai_agent_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  conversation_title TEXT,
  intent TEXT, -- CREATE_FD, APPLY_LOAN, CREATE_RD, GET_RECOMMENDATION
  status TEXT DEFAULT 'ongoing', -- ongoing, completed, abandoned
  
  total_messages INTEGER DEFAULT 0,
  total_turns INTEGER DEFAULT 0,
  
  language TEXT DEFAULT 'en',
  channel TEXT DEFAULT 'text', -- text, voice
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON ai_agent_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_ai_conversations_user_id ON ai_agent_conversations(user_id);
CREATE INDEX idx_ai_conversations_status ON ai_agent_conversations(status);

-- =============================================
-- AI AGENT MESSAGES (Chat History)
-- =============================================

CREATE TABLE ai_agent_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_agent_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  message_type TEXT NOT NULL, -- user_input, agent_response, agent_action, confirmation
  content TEXT,
  
  -- For agent actions
  action_type TEXT, -- check_eligibility, create_fd, apply_loan, etc.
  action_parameters JSONB,
  action_result JSONB,
  action_status TEXT, -- pending, completed, failed
  
  -- For user inputs
  input_method TEXT, -- text, voice
  input_confidence NUMERIC(3,2), -- 0-1 for voice
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation_id ON ai_agent_messages(conversation_id);
CREATE INDEX idx_ai_messages_user_id ON ai_agent_messages(user_id);

-- =============================================
-- TRANSACTION AUDIT LOG
-- =============================================

CREATE TABLE banking_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL, 
  -- create_fd, break_fd, apply_loan, approve_loan, create_rd, etc.
  
  resource_type TEXT, -- fixed_deposit, loan, recurring_deposit, account
  resource_id UUID,
  
  -- For AI-initiated actions
  initiated_by TEXT DEFAULT 'user', -- user, ai_agent, system
  conversation_id UUID REFERENCES ai_agent_conversations(id),
  
  amount NUMERIC(15,2),
  status TEXT, -- success, failed, pending, rolled_back
  
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_banking_audit_log_user_id ON banking_audit_log(user_id);
CREATE INDEX idx_banking_audit_log_action_type ON banking_audit_log(action_type);
CREATE INDEX idx_banking_audit_log_created_at ON banking_audit_log(created_at DESC);

-- =============================================
-- PORTFOLIO RECOMMENDATIONS HISTORY
-- =============================================

CREATE TABLE portfolio_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  recommendation_date TIMESTAMPTZ DEFAULT NOW(),
  risk_profile TEXT, -- low, medium, high
  investment_horizon INTEGER, -- months
  
  recommendations JSONB, -- [
                 -- {
                 --   "product_id": "uuid",
                 --   "allocation_percent": 30,
                 --   "reasoning": "..."
                 -- }
                 -- ]
  
  accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMPTZ,
  action_taken TEXT,
  
  ai_conversation_id UUID REFERENCES ai_agent_conversations(id)
);

CREATE INDEX idx_portfolio_recommendations_user_id ON portfolio_recommendations(user_id);

-- =============================================
-- SCHEDULED TASKS (For cron jobs / automation)
-- =============================================

CREATE TABLE scheduled_banking_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  task_type TEXT NOT NULL, 
  -- rd_payment_due, fd_maturity_notification, loan_emi_due, etc.
  
  linked_resource_id UUID, -- FD ID, RD ID, Loan ID, etc.
  linked_resource_type TEXT,
  
  scheduled_for TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, completed, failed, skipped
  
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_tasks_user_id ON scheduled_banking_tasks(user_id);
CREATE INDEX idx_scheduled_tasks_scheduled_for ON scheduled_banking_tasks(scheduled_for);
CREATE INDEX idx_scheduled_tasks_status ON scheduled_banking_tasks(status);
