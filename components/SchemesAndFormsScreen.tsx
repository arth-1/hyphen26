import { ArrowLeft, Landmark, IdCard, Banknote, UsersRound, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

interface SchemesAndFormsScreenProps {
  language: string;
  onBack: () => void;
  onSelect: (templateId: string) => void;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Forms & Government Schemes',
    subtitle: 'Pick a form or scheme to begin. You can auto-fill using your profile and answers.',
    popular: 'Popular',
    bankForms: 'Bank Forms',
    govtSchemes: 'Government Schemes',
    kcc: 'Kisan Credit Card (KCC)',
    loan: 'Small Business Loan',
    kyc: 'KYC Update / Re-KYC',
    ssy: 'Sukanya Samriddhi Yojana',
    bbbp: 'Beti Bachao Beti Padhao',
    back: 'Back',
  },
  hi: {
    title: 'फॉर्म और सरकारी योजनाएं',
    subtitle: 'शुरू करने के लिए किसी फ़ॉर्म या योजना का चयन करें। प्रोफ़ाइल और उत्तरों से ऑटो-फिल हो सकता है।',
    popular: 'लोकप्रिय',
    bankForms: 'बैंक फॉर्म',
    govtSchemes: 'सरकारी योजनाएं',
    kcc: 'किसान क्रेडिट कार्ड (KCC)',
    loan: 'लघु व्यवसाय ऋण',
    kyc: 'KYC अपडेट / री-KYC',
    ssy: 'सुकन्या समृद्धि योजना',
    bbbp: 'बेटी बचाओ बेटी पढ़ाओ',
    back: 'वापस',
  },
};

type Item = { id: string; label: string; icon: ReactNode; section: 'popular' | 'bank' | 'govt' };

function Section({ title, filter, items, onSelect }: { title: string; filter: 'popular' | 'bank' | 'govt'; items: Item[]; onSelect: (id: string) => void }) {
  return (
    <div className="mb-6">
      <h3 className="text-gray-900 font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.filter(i => i.section === filter).map(i => (
          <button key={i.id} onClick={() => onSelect(i.id)} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              {i.icon}
            </div>
            <span className="text-gray-900 text-sm text-left leading-tight">{i.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SchemesAndFormsScreen({ language, onBack, onSelect }: SchemesAndFormsScreenProps) {
  const t = translations[language] || translations.en;

  const items: Item[] = [
    { id: 'bank_kcc', label: t.kcc, icon: <Banknote className="w-5 h-5 text-teal-600" />, section: 'popular' },
    { id: 'gov_ssy', label: t.ssy, icon: <UsersRound className="w-5 h-5 text-rose-600" />, section: 'popular' },
    { id: 'kyc_update', label: t.kyc, icon: <IdCard className="w-5 h-5 text-indigo-600" />, section: 'popular' },

    { id: 'bank_kcc', label: t.kcc, icon: <Banknote className="w-5 h-5 text-teal-600" />, section: 'bank' },
    { id: 'bank_loan', label: t.loan, icon: <Landmark className="w-5 h-5 text-amber-600" />, section: 'bank' },
    { id: 'kyc_update', label: t.kyc, icon: <IdCard className="w-5 h-5 text-indigo-600" />, section: 'bank' },

    { id: 'gov_ssy', label: t.ssy, icon: <UsersRound className="w-5 h-5 text-rose-600" />, section: 'govt' },
    { id: 'gov_bbbp', label: t.bbbp, icon: <Sparkles className="w-5 h-5 text-pink-600" />, section: 'govt' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-blue-50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:shadow-md" aria-label={t.back}>
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h2 className="text-gray-900 font-semibold">{t.title}</h2>
          <p className="text-gray-600 text-xs">{t.subtitle}</p>
        </div>
      </div>

      <Section title={t.popular} filter="popular" items={items} onSelect={onSelect} />
      <Section title={t.bankForms} filter="bank" items={items} onSelect={onSelect} />
      <Section title={t.govtSchemes} filter="govt" items={items} onSelect={onSelect} />
    </div>
  );
}
