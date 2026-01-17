import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, ShieldAlert, Check, Users, Send } from 'lucide-react';

interface TransferScreenProps {
  onBack: () => void;
  language: string;
}

type Beneficiary = {
  id: string;
  name: string;
  upi_id?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
};

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Bank Transfer',
    beneficiaries: 'Beneficiaries',
    addNew: 'Add New',
    amount: 'Amount',
    description: 'Description (optional)',
    send: 'Send',
    newName: 'Name',
    newAccount: 'Account Number',
    newIfsc: 'IFSC Code',
    newUpi: 'UPI ID (optional)',
    flagged: 'Flagged by fraud detection',
    blocked: 'Transfer blocked for your safety',
    success: 'Transfer completed',
  },
  hi: {
    title: 'बैंक ट्रांसफ़र',
    beneficiaries: 'लाभार्थी',
    addNew: 'नया जोड़ें',
    amount: 'राशि',
    description: 'विवरण (वैकल्पिक)',
    send: 'भेजें',
    newName: 'नाम',
    newAccount: 'खाता संख्या',
    newIfsc: 'IFSC कोड',
    newUpi: 'UPI ID (वैकल्पिक)',
    flagged: 'धोखाधड़ी जाँच द्वारा फ़्लैग किया गया',
    blocked: 'आपकी सुरक्षा के लिए ट्रांसफ़र रोका गया',
    success: 'ट्रांसफ़र पूरा हुआ',
  },
};

export default function TransferScreen({ onBack, language }: TransferScreenProps) {
  const t = translations[language] || translations.en;
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newBen, setNewBen] = useState<{ name: string; account_number?: string; ifsc_code?: string; upi_id?: string }>({ name: '' });
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: string; flagged?: boolean; riskScore?: number; message?: string; fraud?: { ai?: { reasons?: string[] } } } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/beneficiaries/list');
      const data = await res.json();
      setBeneficiaries(data.beneficiaries || []);
    })();
  }, []);

  const handleAdd = async () => {
    if (!newBen.name || (!newBen.upi_id && !newBen.account_number)) return;
    const res = await fetch('/api/beneficiaries/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBen),
    });
    const data = await res.json();
    if (data.beneficiary) {
      setBeneficiaries([data.beneficiary, ...beneficiaries]);
      setSelectedId(data.beneficiary.id);
      setAdding(false);
      setNewBen({ name: '' });
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setResult(null);
    try {
  const body: { amount: number; description?: string; beneficiaryId?: string; newBeneficiary?: { name: string; account_number?: string; ifsc_code?: string; upi_id?: string } } = { amount: Number(amount) };
  if (description) body.description = description;
  if (selectedId) body.beneficiaryId = selectedId;
  else if (newBen.name) body.newBeneficiary = newBen;
      const res = await fetch('/api/transactions/transfer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-blue-50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:shadow-md" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-gray-900 font-semibold">{t.title}</h2>
      </div>

      {/* Beneficiaries */}
      <div className="bg-white rounded-2xl p-4 shadow mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Users className="w-5 h-5 text-teal-600" /><span className="font-medium">{t.beneficiaries}</span></div>
          <button onClick={() => setAdding(v => !v)} className="text-sm text-teal-600 flex items-center gap-1"><Plus className="w-4 h-4" /> {t.addNew}</button>
        </div>
        {adding && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <input className="border rounded-lg p-2" placeholder={t.newName} value={newBen.name} onChange={e => setNewBen({ ...newBen, name: e.target.value })} />
            <input className="border rounded-lg p-2" placeholder={t.newAccount} value={newBen.account_number || ''} onChange={e => setNewBen({ ...newBen, account_number: e.target.value })} />
            <input className="border rounded-lg p-2" placeholder={t.newIfsc} value={newBen.ifsc_code || ''} onChange={e => setNewBen({ ...newBen, ifsc_code: e.target.value })} />
            <input className="border rounded-lg p-2" placeholder={t.newUpi} value={newBen.upi_id || ''} onChange={e => setNewBen({ ...newBen, upi_id: e.target.value })} />
            <div className="md:col-span-4 flex gap-2">
              <button onClick={handleAdd} className="bg-teal-600 text-white px-4 py-2 rounded-lg">{t.addNew}</button>
              <button onClick={() => setAdding(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {beneficiaries.map(b => (
            <label key={b.id} className={`border rounded-xl p-3 flex items-center justify-between ${selectedId === b.id ? 'border-teal-500 bg-teal-50' : 'bg-white'}`}>
              <div>
                <p className="font-medium text-gray-900">{b.name}</p>
                <p className="text-xs text-gray-500">{b.upi_id || `${b.account_number} · ${b.ifsc_code}`}</p>
              </div>
              <input type="radio" name="beneficiary" checked={selectedId === b.id} onChange={() => setSelectedId(b.id)} />
            </label>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="bg-white rounded-2xl p-4 shadow mb-4">
        <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border rounded-lg p-3 text-lg" placeholder={t.amount} />
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded-lg p-3 mt-2" placeholder={t.description} />
      </div>

      <button onClick={handleSend} disabled={loading || !amount || (!selectedId && !newBen.name)} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-2xl p-4 flex items-center justify-center gap-2 shadow">
        <Send className="w-5 h-5" />
        <span>{loading ? '...' : t.send}</span>
      </button>

      {result && (
        <div className={`mt-4 rounded-2xl p-4 ${result.flagged ? 'bg-rose-50 border border-rose-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            {result.flagged ? <ShieldAlert className="w-5 h-5 text-rose-600" /> : <Check className="w-5 h-5 text-green-600" />}
            <span className={`${result.flagged ? 'text-rose-700' : 'text-green-700'} font-medium`}>
              {result.flagged ? t.flagged : t.success}
            </span>
          </div>
          {result.message && <p className="text-sm text-gray-700">{result.message}</p>}
          {typeof result.riskScore === 'number' && <p className="text-xs text-gray-500 mt-1">Risk Score: {result.riskScore}</p>}
          {result.fraud?.ai?.reasons && result.fraud.ai.reasons.length > 0 && (
            <ul className="mt-2 text-xs text-gray-700 list-disc pl-5">
              {result.fraud.ai.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
