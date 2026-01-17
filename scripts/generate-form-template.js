const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, BorderStyle, WidthType, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

const doc = new Document({
  sections: [
    {
      children: [
        // Title
        new Paragraph({
          text: 'Basic Customer Information & Loan Application Form',
          heading: 'Heading1',
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          bold: true,
          size: 28,
        }),

        new Paragraph({
          text: 'Please fill in the details clearly. Fields marked * are mandatory.',
          spacing: { after: 400 },
          italics: true,
        }),

        // Section 1: Applicant Details
        new Paragraph({
          text: '1. Applicant Details',
          heading: 'Heading2',
          bold: true,
          spacing: { before: 200, after: 200 },
        }),

        createFieldRow('Full Name*:', '{fullName}'),
        createFieldRow('Date of Birth*:', '{dob}'),
        createFieldRow('Gender:', '{gender}'),
        createFieldRow('Marital Status:', '{maritalStatus}'),
        createFieldRow('Mobile Number*:', '{mobile}'),
        createFieldRow('Email ID:', '{email}'),
        createFieldRow('PAN* / Form 60:', '{pan}'),
        createFieldRow('Aadhaar (last 4 digits only):', '{aadhaar}'),

        // Section 2: Address Details
        new Paragraph({
          text: '2. Address Details',
          heading: 'Heading2',
          bold: true,
          spacing: { before: 400, after: 200 },
        }),

        createFieldRow('Current Address*:', '{address}'),
        createFieldRow('City*:', '{city}'),
        createFieldRow('State*:', '{state}'),
        createFieldRow('PIN Code*:', '{pin}'),
        createFieldRow('Permanent Address (if different):', '{permanentAddress}'),

        // Section 3: Occupation & Income
        new Paragraph({
          text: '3. Occupation & Income',
          heading: 'Heading2',
          bold: true,
          spacing: { before: 400, after: 200 },
        }),

        createFieldRow('Occupation Type* (Salaried / Self-Employed / Student / Retired / Homemaker):', '{occupation}'),
        createFieldRow('Employer / Business Name:', '{employer}'),
        createFieldRow('Designation / Nature of Business:', '{designation}'),
        createFieldRow('Annual Income Range*:', '{income}'),

        // Section 4: Loan Details
        new Paragraph({
          text: '4. Loan Details (if applicable)',
          heading: 'Heading2',
          bold: true,
          spacing: { before: 400, after: 200 },
        }),

        createFieldRow('Type of Loan (Home / Personal / Education / Business / Vehicle):', '{loanType}'),
        createFieldRow('Loan Amount Required:', '{loanAmount}'),
        createFieldRow('Loan Purpose:', '{loanPurpose}'),
        createFieldRow('Preferred Tenure (months):', '{tenure}'),

        // Section 5: Declaration
        new Paragraph({
          text: '5. Bank & KYC Declaration',
          heading: 'Heading2',
          bold: true,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          text: '☐ I confirm that the information provided above is true and correct to the best of my knowledge.',
          spacing: { after: 100 },
        }),

        new Paragraph({
          text: '☐ I authorize the bank to verify my details for KYC and loan processing purposes.',
          spacing: { after: 400 },
        }),

        // Signature Section
        createFieldRow('Place:', '{place}'),
        createFieldRow('Date:', '{date}'),
        createFieldRow('Signature of Applicant:', '{signature}'),
      ],
    },
  ],
});

function createFieldRow(label, placeholder) {
  return new Paragraph({
    text: label,
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: `\n${placeholder}`,
        underline: {},
      }),
    ],
  });
}

// Generate the document
Packer.toBuffer(doc).then((buffer) => {
  const outputPath = path.join(__dirname, '../public/Simplified_Bank_Loan_Form.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ Word template generated successfully at:', outputPath);
});
