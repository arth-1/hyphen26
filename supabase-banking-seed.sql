-- ADAPT Banking Platform - Seed Data for Demo & Testing
-- This file populates mock banking data for demonstration purposes

-- =============================================
-- INSERT MOCK USERS (if not already from auth)
-- =============================================

-- Insert test users with banking profiles
INSERT INTO users (id, phone_number, email, full_name, preferred_language, is_verified, kyc_status, soft_credit_score)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '+919876543210', 'rajesh@example.com', 'Rajesh Kumar', 'hi', true, 'verified', 750),
  ('550e8400-e29b-41d4-a716-446655440002', '+919876543211', 'priya@example.com', 'Priya Sharma', 'hi', true, 'verified', 800),
  ('550e8400-e29b-41d4-a716-446655440003', '+919876543212', 'amit@example.com', 'Amit Patel', 'en', true, 'verified', 680),
  ('550e8400-e29b-41d4-a716-446655440004', '+919876543213', 'neha@example.com', 'Neha Singh', 'hi', true, 'verified', 720),
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- INSERT MOCK ACCOUNTS
-- =============================================

INSERT INTO accounts (id, user_id, account_type, account_number, ifsc_code, balance, monthly_income)
VALUES
  ('550e8400-e29b-41d4-a716-446655450001', '550e8400-e29b-41d4-a716-446655440001', 'savings', 'ADAPT000100001', 'ADAPT0001', 500000, 75000),
  ('550e8400-e29b-41d4-a716-446655450002', '550e8400-e29b-41d4-a716-446655440001', 'salary', 'ADAPT000100002', 'ADAPT0001', 250000, 75000),
  ('550e8400-e29b-41d4-a716-446655450003', '550e8400-e29b-41d4-a716-446655440002', 'savings', 'ADAPT000200001', 'ADAPT0001', 1000000, 150000),
  ('550e8400-e29b-41d4-a716-446655450004', '550e8400-e29b-41d4-a716-446655440002', 'salary', 'ADAPT000200002', 'ADAPT0001', 500000, 150000),
  ('550e8400-e29b-41d4-a716-446655450005', '550e8400-e29b-41d4-a716-446655440003', 'savings', 'ADAPT000300001', 'ADAPT0001', 300000, 50000),
  ('550e8400-e29b-41d4-a716-446655450006', '550e8400-e29b-41d4-a716-446655440004', 'savings', 'ADAPT000400001', 'ADAPT0001', 400000, 60000)
ON CONFLICT (account_number) DO NOTHING;

-- =============================================
-- INSERT INVESTMENT PRODUCTS CATALOG
-- =============================================

INSERT INTO investment_products (id, product_name, product_type, description, min_amount, max_amount, current_interest_rate, min_tenure_days, max_tenure_days, risk_level, tax_benefit_type, features, is_active, priority_score)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655460001',
    'Fixed Deposit - 1 Year',
    'fd',
    'Safe, guaranteed returns with 1-year tenure',
    1000,
    10000000,
    6.5,
    365,
    365,
    'low',
    'none',
    '{"auto_renewal": true, "premature_withdrawal": true, "partial_withdrawal": false, "loan_against": true}',
    true,
    1
  ),
  (
    '550e8400-e29b-41d4-a716-446655460002',
    'Fixed Deposit - 3 Years',
    'fd',
    'Higher returns with 3-year tenure - Best for long-term savings',
    1000,
    10000000,
    7.5,
    1095,
    1095,
    'low',
    'tax_saving',
    '{"auto_renewal": true, "premature_withdrawal": true, "partial_withdrawal": false, "loan_against": true}',
    true,
    2
  ),
  (
    '550e8400-e29b-41d4-a716-446655460003',
    'Fixed Deposit - 5 Years',
    'fd',
    'Maximum returns with tax benefits',
    1000,
    10000000,
    7.75,
    1825,
    1825,
    'low',
    'tax_saving',
    '{"auto_renewal": true, "premature_withdrawal": true, "partial_withdrawal": false, "loan_against": true}',
    true,
    3
  ),
  (
    '550e8400-e29b-41d4-a716-446655460004',
    'Recurring Deposit - 36 Months',
    'rd',
    'Monthly savings with guaranteed returns',
    1000,
    500000,
    5.5,
    30,
    1095,
    'low',
    'none',
    '{"auto_debit": true, "partial_withdrawal": false, "loan_against": false}',
    true,
    4
  ),
  (
    '550e8400-e29b-41d4-a716-446655460005',
    'Personal Loan',
    'loan',
    'Instant personal loans up to ₹5 lakhs',
    10000,
    500000,
    12.5,
    180,
    720,
    'medium',
    'none',
    '{"quick_approval": true, "digital_disbursal": true, "emi_options": true}',
    true,
    5
  ),
  (
    '550e8400-e29b-41d4-a716-446655460006',
    'Business Loan',
    'loan',
    'Loans for small businesses and startups',
    50000,
    2000000,
    11.0,
    180,
    1080,
    'high',
    'business_deduction',
    '{"flexible_repayment": true, "collateral_free": false, "emi_options": true}',
    true,
    6
  ),
  (
    '550e8400-e29b-41d4-a716-446655460007',
    'Education Loan',
    'loan',
    'Loans for higher education with low interest',
    100000,
    1000000,
    7.0,
    180,
    1080,
    'low',
    'tax_deduction',
    '{"moratorium_period": true, "flexible_repayment": true, "emi_options": true}',
    true,
    7
  ),
  (
    '550e8400-e29b-41d4-a716-446655460008',
    'Mutual Fund SIP',
    'mf',
    'Systematic Investment Plan - Build wealth over time',
    500,
    100000,
    12.0,
    360,
    36500,
    'high',
    'tax_saving',
    '{"monthly_sip": true, "auto_invest": true, "diversified_portfolio": true}',
    true,
    8
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- INSERT MOCK FIXED DEPOSITS
-- =============================================

INSERT INTO fixed_deposits (id, user_id, account_id, principal_amount, interest_rate, tenure_days, maturity_amount, status, created_at, maturity_date, created_via_agent, agent_metadata)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655470001',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655450001',
    100000,
    7.0,
    730,
    114903,
    'active',
    NOW() - INTERVAL '60 days',
    NOW() + INTERVAL '670 days',
    false,
    '{"created_manually": true}'
  ),
  (
    '550e8400-e29b-41d4-a716-446655470002',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655450003',
    250000,
    7.5,
    1095,
    340391,
    'active',
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '1065 days',
    false,
    '{"created_manually": true}'
  ),
  (
    '550e8400-e29b-41d4-a716-446655470003',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655450002',
    50000,
    6.5,
    365,
    53263,
    'matured',
    NOW() - INTERVAL '365 days',
    NOW(),
    false,
    '{"created_manually": true}'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- INSERT MOCK RECURRING DEPOSITS
-- =============================================

INSERT INTO recurring_deposits (id, user_id, account_id, monthly_amount, interest_rate, tenure_months, months_completed, maturity_amount, status, start_date, maturity_date, next_payment_date, auto_debit_enabled, auto_debit_day, created_via_agent)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655480001',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655450001',
    5000,
    5.5,
    36,
    12,
    195000,
    'active',
    NOW() - INTERVAL '360 days',
    NOW() + INTERVAL '720 days',
    NOW() + INTERVAL '5 days',
    true,
    1,
    false
  ),
  (
    '550e8400-e29b-41d4-a716-446655480002',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655450003',
    10000,
    5.5,
    24,
    6,
    260000,
    'active',
    NOW() - INTERVAL '180 days',
    NOW() + INTERVAL '540 days',
    NOW() + INTERVAL '10 days',
    true,
    10,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- INSERT MOCK LOANS
-- =============================================

INSERT INTO loans (id, user_id, loan_type, amount_requested, amount_approved, interest_rate, tenure_months, monthly_emi, status, reason, employment_type, annual_income, applied_at, approved_at, auto_approved, auto_approval_reason)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655490001',
    '550e8400-e29b-41d4-a716-446655440001',
    'personal',
    200000,
    200000,
    12.5,
    60,
    4500,
    'disbursed',
    'Education expenses',
    'salaried',
    900000,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '85 days',
    true,
    'Credit score > 700 and verified income'
  ),
  (
    '550e8400-e29b-41d4-a716-446655490002',
    '550e8400-e29b-41d4-a716-446655440002',
    'business',
    500000,
    500000,
    11.0,
    60,
    10500,
    'active',
    'Business expansion',
    'self_employed',
    1800000,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '55 days',
    true,
    'High credit score and strong financial profile'
  ),
  (
    '550e8400-e29b-41d4-a716-446655490003',
    '550e8400-e29b-41d4-a716-446655440003',
    'personal',
    150000,
    null,
    null,
    null,
    null,
    'under_review',
    'Car purchase',
    'salaried',
    600000,
    NOW() - INTERVAL '5 days',
    null,
    false,
    null
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- INSERT LOAN DOCUMENTS
-- =============================================

INSERT INTO loan_documents (id, loan_id, document_type, status, uploaded_at, verified_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655500001', '550e8400-e29b-41d4-a716-446655490001', 'income_proof', 'verified', NOW() - INTERVAL '85 days', NOW() - INTERVAL '80 days'),
  ('550e8400-e29b-41d4-a716-446655500002', '550e8400-e29b-41d4-a716-446655490001', 'kyc', 'verified', NOW() - INTERVAL '85 days', NOW() - INTERVAL '80 days'),
  ('550e8400-e29b-41d4-a716-446655500003', '550e8400-e29b-41d4-a716-446655490002', 'income_proof', 'verified', NOW() - INTERVAL '55 days', NOW() - INTERVAL '50 days'),
  ('550e8400-e29b-41d4-a716-446655500004', '550e8400-e29b-41d4-a716-446655490002', 'business_registration', 'verified', NOW() - INTERVAL '55 days', NOW() - INTERVAL '50 days'),
  ('550e8400-e29b-41d4-a716-446655500005', '550e8400-e29b-41d4-a716-446655490003', 'income_proof', 'pending', NOW() - INTERVAL '5 days', null),
  ('550e8400-e29b-41d4-a716-446655500006', '550e8400-e29b-41d4-a716-446655490003', 'kyc', 'pending', NOW() - INTERVAL '5 days', null)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- INSERT PORTFOLIO RECOMMENDATIONS TEMPLATE
-- =============================================

INSERT INTO portfolio_recommendations (id, user_id, recommendation_date, risk_profile, investment_horizon, recommendations, accepted)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655510001',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW(),
    'medium',
    360,
    '[
      {"product_name": "Emergency Fund", "type": "savings", "allocation_percent": 20, "amount": 100000, "reasoning": "3-4 months of expenses"},
      {"product_name": "Fixed Deposit 3Y", "type": "fd", "allocation_percent": 35, "amount": 175000, "reasoning": "Safe returns - 7.5% p.a."},
      {"product_name": "Recurring Deposit", "type": "rd", "allocation_percent": 25, "amount": 125000, "reasoning": "Disciplined savings - ₹5000/month"},
      {"product_name": "Mutual Fund SIP", "type": "mf", "allocation_percent": 20, "amount": 100000, "reasoning": "Long-term growth - ₹5000/month"}
    ]',
    false
  ),
  (
    '550e8400-e29b-41d4-a716-446655510002',
    '550e8400-e29b-41d4-a716-446655440002',
    NOW(),
    'high',
    720,
    '[
      {"product_name": "Emergency Fund", "type": "savings", "allocation_percent": 15, "amount": 150000, "reasoning": "6 months of expenses"},
      {"product_name": "Fixed Deposit 5Y", "type": "fd", "allocation_percent": 25, "amount": 250000, "reasoning": "Highest returns - 7.75% p.a."},
      {"product_name": "Equity Mutual Funds", "type": "mf", "allocation_percent": 40, "amount": 400000, "reasoning": "Growth portfolio - 12%+ returns"},
      {"product_name": "Insurance", "type": "insurance", "allocation_percent": 5, "amount": "Premium only", "reasoning": "Term insurance ₹50L cover"}
    ]',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- INSERT AUDIT LOG SAMPLES
-- =============================================

INSERT INTO banking_audit_log (id, user_id, action_type, resource_type, resource_id, initiated_by, amount, status, details)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655520001',
    '550e8400-e29b-41d4-a716-446655440001',
    'create_fd',
    'fixed_deposit',
    '550e8400-e29b-41d4-a716-446655470001',
    'user',
    100000,
    'success',
    '{"rate": 7.0, "tenure_days": 730, "maturity": 114903}'
  ),
  (
    '550e8400-e29b-41d4-a716-446655520002',
    '550e8400-e29b-41d4-a716-446655440001',
    'apply_loan',
    'loan',
    '550e8400-e29b-41d4-a716-446655490001',
    'user',
    200000,
    'success',
    '{"loan_type": "personal", "tenure": 60, "emi": 4500}'
  ),
  (
    '550e8400-e29b-41d4-a716-446655520003',
    '550e8400-e29b-41d4-a716-446655440002',
    'create_rd',
    'recurring_deposit',
    '550e8400-e29b-41d4-a716-446655480002',
    'user',
    10000,
    'success',
    '{"monthly_amount": 10000, "tenure": 24, "auto_debit": true}'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SUMMARY STATS
-- =============================================

-- Display seed data summary
SELECT 
  'Users' as entity, COUNT(*) as count 
FROM users 
WHERE created_at > NOW() - INTERVAL '1 day'
UNION ALL
SELECT 'Accounts', COUNT(*) FROM accounts WHERE created_at > NOW() - INTERVAL '1 day'
UNION ALL
SELECT 'Fixed Deposits', COUNT(*) FROM fixed_deposits WHERE created_at > NOW() - INTERVAL '1 day'
UNION ALL
SELECT 'Recurring Deposits', COUNT(*) FROM recurring_deposits WHERE created_at > NOW() - INTERVAL '1 day'
UNION ALL
SELECT 'Loans', COUNT(*) FROM loans WHERE created_at > NOW() - INTERVAL '1 day'
UNION ALL
SELECT 'Products', COUNT(*) FROM investment_products WHERE created_at > NOW() - INTERVAL '1 day';
