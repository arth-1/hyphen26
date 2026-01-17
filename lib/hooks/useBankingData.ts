'use client';

import { useState, useEffect } from 'react';

interface Account {
  id: string;
  account_number: string;
  account_type: 'savings' | 'current' | 'salary';
  balance: string;
  currency: string;
  branch_code?: string;
  ifsc_code?: string;
  status: 'active' | 'inactive' | 'frozen';
  monthly_income?: string;
}

interface FixedDeposit {
  id: string;
  account_id: string;
  principal_amount: string;
  interest_rate: string;
  tenure_months: number;
  maturity_amount: string;
  maturity_date: string;
  status: 'active' | 'matured' | 'premature_closed';
  created_at: string;
}

interface Loan {
  id: string;
  account_id: string;
  loan_type: 'personal' | 'home' | 'auto' | 'education' | 'gold';
  applied_amount: string;
  sanctioned_amount?: string;
  outstanding_balance?: string;
  interest_rate: string;
  tenure_months: number;
  emi_amount?: string;
  emi_day?: number;
  next_emi_date?: string;
  disbursement_date?: string;
  status: 'pending_approval' | 'approved' | 'disbursed' | 'active' | 'rejected' | 'closed' | 'defaulted';
  created_at: string;
}

interface RecurringDeposit {
  id: string;
  account_id: string;
  monthly_amount: string;
  interest_rate: string;
  tenure_months: number;
  current_value?: string;
  maturity_amount: string;
  maturity_date: string;
  auto_debit_enabled: boolean;
  next_payment_date?: string;
  payments_made: number;
  status: 'active' | 'matured' | 'defaulted' | 'premature_closed';
  created_at: string;
}

export function useBankingData() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [recurringDeposits, setRecurringDeposits] = useState<RecurringDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllBankingData();
  }, []);

  const fetchAllBankingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [accountsRes, fdsRes, loansRes, rdsRes] = await Promise.all([
        fetch('/api/banking/accounts'),
        fetch('/api/banking/fixed-deposits'),
        fetch('/api/banking/loans'),
        fetch('/api/banking/recurring-deposits'),
      ]);

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData.accounts || []);
      }

      if (fdsRes.ok) {
        const fdsData = await fdsRes.json();
        setFixedDeposits(fdsData.fixedDeposits || []);
      }

      if (loansRes.ok) {
        const loansData = await loansRes.json();
        setLoans(loansData.loans || []);
      }

      if (rdsRes.ok) {
        const rdsData = await rdsRes.json();
        setRecurringDeposits(rdsData.recurringDeposits || []);
      }
    } catch (err) {
      console.error('Error fetching banking data:', err);
      setError('Failed to load banking data');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchAllBankingData();
  };

  return {
    accounts,
    fixedDeposits,
    loans,
    recurringDeposits,
    loading,
    error,
    refresh,
  };
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/banking/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  return { accounts, loading, refresh: fetchAccounts };
}

export function useFixedDeposits() {
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFixedDeposits();
  }, []);

  const fetchFixedDeposits = async () => {
    try {
      const res = await fetch('/api/banking/fixed-deposits');
      if (res.ok) {
        const data = await res.json();
        setFixedDeposits(data.fixedDeposits || []);
      }
    } catch (error) {
      console.error('Error fetching fixed deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  return { fixedDeposits, loading, refresh: fetchFixedDeposits };
}

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await fetch('/api/banking/loans');
      if (res.ok) {
        const data = await res.json();
        setLoans(data.loans || []);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  return { loans, loading, refresh: fetchLoans };
}

export function useRecurringDeposits() {
  const [recurringDeposits, setRecurringDeposits] = useState<RecurringDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecurringDeposits();
  }, []);

  const fetchRecurringDeposits = async () => {
    try {
      const res = await fetch('/api/banking/recurring-deposits');
      if (res.ok) {
        const data = await res.json();
        setRecurringDeposits(data.recurringDeposits || []);
      }
    } catch (error) {
      console.error('Error fetching recurring deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  return { recurringDeposits, loading, refresh: fetchRecurringDeposits };
}
