-- Seed data for ADAPT Banking Platform
-- Run this after creating the schema

-- Sample Form Template: Loan Application
INSERT INTO form_templates (id, name, category, description, fields, language_support) VALUES
(
  'loan-application',
  'Loan Application Form',
  'loan_application',
  'Application for agricultural loan',
  '[
    {
      "name": "full_name",
      "type": "text",
      "required": true,
      "label": {
        "hi": "आपका पूरा नाम क्या है?",
        "en": "What is your full name?",
        "ta": "உங்கள் முழு பெயர் என்ன?",
        "te": "మీ పూర్తి పేరు ఏమిటి?",
        "bn": "আপনার পুরো নাম কি?"
      }
    },
    {
      "name": "phone_number",
      "type": "text",
      "required": true,
      "label": {
        "hi": "आपका मोबाइल नंबर क्या है?",
        "en": "What is your mobile number?",
        "ta": "உங்கள் மொபைல் எண் என்ன?",
        "te": "మీ మొబైల్ నంబర్ ఏమిటి?",
        "bn": "আপনার মোবাইল নম্বর কি?"
      }
    },
    {
      "name": "village",
      "type": "text",
      "required": true,
      "label": {
        "hi": "आप किस गाँव से हैं?",
        "en": "Which village are you from?",
        "ta": "நீங்கள் எந்த கிராமத்தைச் சேர்ந்தவர்?",
        "te": "మీరు ఏ గ్రామం నుండి వచ్చారు?",
        "bn": "আপনি কোন গ্রাম থেকে এসেছেন?"
      }
    },
    {
      "name": "land_acres",
      "type": "number",
      "required": true,
      "label": {
        "hi": "आपके पास कितने एकड़ ज़मीन है?",
        "en": "How many acres of land do you have?",
        "ta": "உங்களிடம் எத்தனை ஏக்கர் நிலம் உள்ளது?",
        "te": "మీకు ఎన్ని ఎకరాల భూమి ఉంది?",
        "bn": "আপনার কত একর জমি আছে?"
      }
    },
    {
      "name": "crop_type",
      "type": "text",
      "required": true,
      "label": {
        "hi": "आप क्या उगाते हैं?",
        "en": "What crops do you grow?",
        "ta": "நீங்கள் என்ன பயிர்கள் வளர்க்கிறீர்கள்?",
        "te": "మీరు ఏ పంటలు పండిస్తారు?",
        "bn": "আপনি কোন ফসল চাষ করেন?"
      }
    },
    {
      "name": "loan_amount",
      "type": "number",
      "required": true,
      "label": {
        "hi": "आपको कितना लोन चाहिए?",
        "en": "How much loan do you need?",
        "ta": "உங்களுக்கு எவ்வளவு கடன் தேவை?",
        "te": "మీకు ఎంత రుణం కావాలి?",
        "bn": "আপনার কত টাকা ঋণ প্রয়োজন?"
      }
    },
    {
      "name": "loan_purpose",
      "type": "text",
      "required": true,
      "label": {
        "hi": "लोन किस लिए चाहिए?",
        "en": "What is the loan for?",
        "ta": "கடன் எதற்காக?",
        "te": "రుణం దేనికోసం?",
        "bn": "ঋণ কীসের জন্য?"
      }
    }
  ]'::jsonb,
  ARRAY['hi', 'en', 'ta', 'te', 'bn']
);

-- Sample Government Circulars (without embeddings initially)
INSERT INTO circulars (title, source, source_url, raw_text, language, category, published_date) VALUES
(
  'किसान क्रेडिट कार्ड योजना 2024',
  'RBI',
  'https://rbi.org.in/kcc-2024',
  'किसान क्रेडिट कार्ड (KCC) भारतीय रिज़र्व बैंक द्वारा शुरू की गई एक योजना है जो किसानों को सस्ते ब्याज दर पर ऋण प्रदान करती है। इस योजना के तहत, किसान अपनी कृषि जरूरतों के लिए ₹3 लाख तक का ऋण प्राप्त कर सकते हैं। ब्याज दर केवल 4% प्रति वर्ष है। आवेदन करने के लिए, आपको अपने नजदीकी बैंक में जाना होगा और भूमि के कागजात, आधार कार्ड, और फोटो जमा करनी होगी। योजना के तहत, समय पर भुगतान करने वाले किसानों को अतिरिक्त छूट भी मिलती है।',
  'hi',
  'loan',
  '2024-01-15'
),
(
  'PM-KISAN Yojana Benefits',
  'Ministry of Agriculture',
  'https://pmkisan.gov.in/benefits',
  'The Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a central sector scheme that provides income support of ₹6,000 per year to all farmer families. The amount is paid in three equal installments of ₹2,000 each, directly into the bank accounts of farmers. To be eligible, you must be a farmer owning cultivable land. Registration can be done online through the PM-KISAN portal or at your nearest Common Service Center. Required documents include Aadhaar card, land ownership papers, and bank account details.',
  'en',
  'subsidy',
  '2024-02-01'
),
(
  'விவசாய நெல் காப்பீடு திட்டம்',
  'Tamil Nadu Agriculture Department',
  'https://tn.gov.in/crop-insurance',
  'விவசாய நெல் காப்பீடு திட்டம் விவசாயிகளுக்கு இயற்கை பேரிடர் மற்றும் பயிர் தோல்வியிலிருந்து நிதி பாதுகாப்பு வழங்குகிறது. இந்த திட்டத்தின் கீழ், விவசாயிகள் தங்கள் பயிர்களுக்கு குறைந்த பிரீமியம் கட்டி காப்பீடு செய்யலாம். கோடை மழை, வெள்ளம், வறட்சி போன்ற இயற்கை பேரழிவுகளால் பாதிக்கப்பட்டால், காப்பீடு தொகை வழங்கப்படும். விண்ணப்பிக்க, உங்கள் அருகிலுள்ள வேளாண்மை அலுவலகத்தை தொடர்பு கொள்ளவும்.',
  'ta',
  'insurance',
  '2024-03-10'
),
(
  'రైతు భరోసా పథకం',
  'Telangana Government',
  'https://telangana.gov.in/rythu-bharosa',
  'రైతు భరోసా పథకం తెలంగాణ ప్రభుత్వం ద్వారా రైతులకు ప్రతి సీజన్‌కు ₹5,000 ఆర్థిక సహాయం అందిస్తుంది. ఈ పథకం క్రింద, రైతులు నేరుగా వారి బ్యాంక్ ఖాతాల్లోకి మొత్తం అందుకుంటారు. అర్హత పొందడానికి, మీరు తెలంగాణ రాష్ట్రంలో భూమి కలిగి ఉండాలి. ఆన్‌లైన్ నమోదు చేసుకోవచ్చు లేదా మీ సమీప మీసేవ కేంద్రంలో విజయపడవచ్చు.',
  'te',
  'subsidy',
  '2024-02-20'
),
(
  'কৃষি ভর্তুকি প্রকল্প ২০২৪',
  'West Bengal Agriculture Department',
  'https://wb.gov.in/krishi-subsidy',
  'পশ্চিমবঙ্গ কৃষি বিভাগ কৃষকদের জন্য বিভিন্ন ভর্তুকি প্রকল্প চালু করেছে। এর মধ্যে রয়েছে সার ভর্তুকি, বীজ ভর্তুকি, এবং কৃষি যন্ত্রপাতি ক্রয়ের জন্য ৫০% ভর্তুকি। কৃষকরা তাদের স্থানীয় কৃষি কার্যালয়ে আবেদন করতে পারেন। প্রয়োজনীয় কাগজপত্র: জমির দলিল, আধার কার্ড, এবং ব্যাংক অ্যাকাউন্ট বিবরণ।',
  'bn',
  'subsidy',
  '2024-01-25'
);

-- Sample User (for testing)
INSERT INTO users (id, phone_number, full_name, preferred_language, is_verified, kyc_status) VALUES
(
  'demo-user',
  '+919876543210',
  'राजेश कुमार',
  'hi',
  true,
  'verified'
);

-- Sample Beneficiaries
INSERT INTO beneficiaries (user_id, name, phone_number, upi_id, is_verified, added_via) VALUES
('demo-user', 'रमेश शर्मा', '+919876543211', 'ramesh@paytm', true, 'manual'),
('demo-user', 'सुरेश पटेल', '+919876543212', 'suresh@paytm', true, 'voice'),
('demo-user', 'मुकेश गुप्ता', '+919876543213', NULL, false, 'voice');

-- Sample Transactions
INSERT INTO transactions (user_id, transaction_type, amount, beneficiary_name, status, payment_method, fraud_check_passed, completed_at) VALUES
('demo-user', 'send', 500, 'रमेश शर्मा', 'completed', 'upi', true, NOW() - INTERVAL '2 days'),
('demo-user', 'receive', 1000, 'श्याम वर्मा', 'completed', 'upi', true, NOW() - INTERVAL '5 days'),
('demo-user', 'send', 2000, 'सुरेश पटेल', 'completed', 'upi', true, NOW() - INTERVAL '7 days');

-- Sample Non-Financial Events
INSERT INTO user_nonfinancial_events (user_id, event_type, category, amount, vendor_name, verified, event_date) VALUES
('demo-user', 'agri_input', 'seeds', 1500, 'राजेश सीड्स', true, NOW() - INTERVAL '30 days'),
('demo-user', 'agri_input', 'fertilizer', 3000, 'भारत उर्वरक', true, NOW() - INTERVAL '45 days'),
('demo-user', 'utility_bill', 'electricity', 800, 'MSEB', true, NOW() - INTERVAL '15 days'),
('demo-user', 'mobile_recharge', 'prepaid', 399, 'Jio', true, NOW() - INTERVAL '10 days');

-- Sample Credit Profile
INSERT INTO credit_profiles (user_id, soft_score, confidence_level, factors, improvement_steps) VALUES
(
  'demo-user',
  725,
  0.75,
  '[
    {"name": "transaction_history", "impact": 50, "value": 3},
    {"name": "agri_inputs", "impact": 100, "value": 2},
    {"name": "utility_payments", "impact": 75, "value": 1},
    {"name": "kyc_verified", "impact": 150, "value": true},
    {"name": "account_age", "impact": 50, "value": 90}
  ]'::jsonb,
  '[
    {"hi": "अधिक लेनदेन करें (कम से कम 10)", "en": "Make more transactions (at least 10)"},
    {"hi": "और कृषि खरीद की रसीदें अपलोड करें", "en": "Upload more agricultural purchase receipts"}
  ]'::jsonb
);

-- Sample Spending Insights
INSERT INTO spending_insights (user_id, period, total_income, total_expenses, category_breakdown, suggestions) VALUES
(
  'demo-user',
  'monthly',
  15000,
  8300,
  '{
    "agri_inputs": 4500,
    "utilities": 800,
    "mobile": 399,
    "transfers": 2500,
    "other": 101
  }'::jsonb,
  '[
    {"hi": "बढ़िया! आप अपनी आय का 55% बचा रहे हैं", "en": "Great! You are saving 55% of your income"},
    {"hi": "कृषि इनपुट पर खर्च ठीक है", "en": "Agricultural input spending is appropriate"},
    {"hi": "बिजली बिल बचाने के लिए सोलर पंप पर विचार करें", "en": "Consider solar pump to save electricity bill"}
  ]'::jsonb
);

-- Sample Security Log
INSERT INTO security_logs (user_id, event_type, ip_address, success, details) VALUES
('demo-user', 'login', '192.168.1.1', true, '{"device": "mobile", "location": "Maharashtra"}'::jsonb),
('demo-user', 'circular_query', '192.168.1.1', true, '{"query": "किसान क्रेडिट कार्ड", "results_count": 1}'::jsonb);

COMMIT;
