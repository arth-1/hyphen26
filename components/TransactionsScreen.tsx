"use client";

import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, RefreshCcw, IndianRupee, Receipt, AlertCircle } from 'lucide-react';

export type TransactionItem = {
  id: string;
  created_at: string;
  transaction_type: 'send' | 'receive' | 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  description?: string | null;
  status: 'pending' | 'completed' | 'failed' | 'flagged';
};

interface TransactionsScreenProps {
  onBack: () => void;
  language: string;
}

const tByLang: Record<string, Record<string, string>> = {
  en: {
    title: 'Transaction History',
    loading: 'Loading transactions…',
    empty: 'No transactions yet',
    retry: 'Refresh',
    amount: 'Amount',
    type: 'Type',
    status: 'Status',
    failed: 'Failed to load transactions',
  },
  hi: {
    title: 'लेन-देन इतिहास',
    loading: 'लेन-देन लोड हो रहे हैं…',
    empty: 'अभी कोई लेन-देन नहीं',
    retry: 'रीफ़्रेश',
    amount: 'राशि',
    type: 'प्रकार',
    status: 'स्थिति',
    failed: 'लेन-देन लोड करने में विफल',
  },
};

function formatAmount(cur: string, amount: number) {
  if (cur === 'INR') return `₹ ${amount.toFixed(2)}`;
  return `${cur} ${amount.toFixed(2)}`;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export function TransactionsScreen({ onBack, language }: TransactionsScreenProps) {
  const t = useMemo(() => tByLang[language] || tByLang.en, [language]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<TransactionItem[]>([]);

  const fetchTxns = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/transactions/list', { method: 'GET' });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setItems((data?.transactions as TransactionItem[]) || []);
    } catch {
      setError(t.failed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow hover:bg-gray-50"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{t.title}</h1>
        <div className="ml-auto">
          <button
            onClick={fetchTxns}
            className="inline-flex items-center gap-2 bg-white rounded-full px-3 py-2 text-sm text-gray-700 shadow hover:bg-gray-50"
          >
            <RefreshCcw className="w-4 h-4" />
            {t.retry}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl p-6 shadow text-gray-600 text-sm flex items-center gap-2">
          <Receipt className="w-5 h-5 text-teal-600" />
          {t.loading}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-6 shadow text-rose-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow text-gray-600 text-sm flex items-center gap-2">
          <Receipt className="w-5 h-5 text-teal-600" />
          {t.empty}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((tx) => (
            <div key={tx.id} className="bg-white rounded-2xl p-4 shadow">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-teal-600" />
                  <span className="text-gray-900 font-medium">{formatAmount(tx.currency, tx.amount)}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  tx.status === 'completed' ? 'bg-teal-50 text-teal-700' : tx.status === 'failed' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {tx.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 capitalize">{tx.transaction_type}</span>
                <span className="text-xs text-gray-500">{formatDate(tx.created_at)}</span>
              </div>
              {tx.description ? (
                <p className="text-sm text-gray-700 mt-2">{tx.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
