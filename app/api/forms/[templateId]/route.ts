import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    // Single canonical template served for all IDs
    const { templateId } = await params;
    const template = bankLoanTemplate;
    return NextResponse.json(template);
  } catch (error) {
    console.error('Form template fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

type Label = { en: string; hi: string; [key: string]: string };
type Field = { name: string; type: 'text' | 'number' | 'date' | 'select' | 'textarea'; label: Label; required: boolean; options?: string[] };
type Template = { id: string; name: string; fields: Field[] };

const bankLoanTemplate: Template = {
  id: 'bank_loan',
  name: 'Basic Customer Information & Loan Application Form',
  fields: [
    { name: 'fullName', type: 'text', label: { en: 'Full Name*', hi: 'पूरा नाम*' }, required: true },
    { name: 'dob', type: 'date', label: { en: 'Date of Birth*', hi: 'जन्म तिथि*' }, required: true },
    { name: 'gender', type: 'text', label: { en: 'Gender', hi: 'लिंग' }, required: false },
    { name: 'maritalStatus', type: 'text', label: { en: 'Marital Status', hi: 'वैवाहिक स्थिति' }, required: false },
    { name: 'mobile', type: 'text', label: { en: 'Mobile Number*', hi: 'मोबाइल नंबर*' }, required: true },
    { name: 'email', type: 'text', label: { en: 'Email ID', hi: 'ईमेल आईडी' }, required: false },
    { name: 'pan', type: 'text', label: { en: 'PAN* / Form 60', hi: 'पैन* / फॉर्म 60' }, required: true },
    { name: 'aadhaar', type: 'text', label: { en: 'Aadhaar (last 4 digits)', hi: 'आधार (आखिरी 4 अंक)' }, required: false },

    { name: 'address', type: 'textarea', label: { en: 'Current Address*', hi: 'वर्तमान पता*' }, required: true },
    { name: 'city', type: 'text', label: { en: 'City*', hi: 'शहर*' }, required: true },
    { name: 'state', type: 'text', label: { en: 'State*', hi: 'राज्य*' }, required: true },
    { name: 'pin', type: 'text', label: { en: 'PIN Code*', hi: 'पिन कोड*' }, required: true },
    { name: 'permanentAddress', type: 'textarea', label: { en: 'Permanent Address (if different)', hi: 'स्थायी पता (यदि अलग हो)' }, required: false },

    { name: 'occupation', type: 'text', label: { en: 'Occupation Type*', hi: 'पेशा प्रकार*' }, required: true },
    { name: 'employer', type: 'text', label: { en: 'Employer / Business Name', hi: 'नियोक्ता / व्यवसाय का नाम' }, required: false },
    { name: 'designation', type: 'text', label: { en: 'Designation / Nature of Business', hi: 'पदनाम / व्यवसाय का प्रकार' }, required: false },
    { name: 'income', type: 'text', label: { en: 'Annual Income Range*', hi: 'वार्षिक आय सीमा*' }, required: true },

    { name: 'loanType', type: 'text', label: { en: 'Type of Loan', hi: 'ऋण का प्रकार' }, required: false },
    { name: 'loanAmount', type: 'number', label: { en: 'Loan Amount Required', hi: 'आवश्यक ऋण राशि' }, required: false },
    { name: 'loanPurpose', type: 'textarea', label: { en: 'Loan Purpose', hi: 'ऋण का उद्देश्य' }, required: false },
    { name: 'tenure', type: 'number', label: { en: 'Preferred Tenure (months)', hi: 'वांछित कार्यकाल (महीने)' }, required: false },

    { name: 'place', type: 'text', label: { en: 'Place', hi: 'स्थान' }, required: false },
    { name: 'date', type: 'date', label: { en: 'Date', hi: 'तारीख' }, required: false },
    { name: 'signature', type: 'text', label: { en: 'Signature of Applicant', hi: 'आवेदक का हस्ताक्षर' }, required: false },
  ],
};
