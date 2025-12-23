'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'phosphor-react';
import DebtTable from '@/components/DebtTable';
import DebtForm from '@/components/DebtForm';
import PaymentDialog from '@/components/PaymentDialog';
import DebtLogsDialog from '@/components/DebtLogsDialog';
import PasscodeDialog from '@/components/PasscodeDialog';
import { Debt, DebtFormData, DebtLog } from '@/types';
import { toast } from '@/lib/toast';

export default function DebtListPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [logs, setLogs] = useState<DebtLog[]>([]);
  const [filters, setFilters] = useState({
    name: '',
    status: '',
    date: '',
    dueDate: '',
  });

  // Check if user is already verified
  useEffect(() => {
    const verified = sessionStorage.getItem('debt-list-verified') === 'true';
    setIsVerified(verified);
  }, []);

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.status) params.append('status', filters.status);
      if (filters.date) params.append('date', filters.date);
      if (filters.dueDate) params.append('due_date', filters.dueDate);

      const response = await fetch(`/api/debts?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch debts');
      }

      setDebts(result.data || []);
    } catch (error) {
      console.error('Error fetching debts:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memuat data hutang');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const handleCreate = async (data: DebtFormData) => {
    try {
      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create debt');
      }

      await fetchDebts();
      toast.success('Hutang berhasil dibuat');
    } catch (error) {
      console.error('Error creating debt:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal membuat hutang');
      throw error;
    }
  };

  const handleUpdate = async (data: DebtFormData) => {
    if (!selectedDebt) return;

    try {
      const response = await fetch(`/api/debts/${selectedDebt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update debt');
      }

      await fetchDebts();
      toast.success('Hutang berhasil diperbarui');
    } catch (error) {
      console.error('Error updating debt:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui hutang');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus hutang ini?')) return;

    try {
      const response = await fetch(`/api/debts/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete debt');
      }

      await fetchDebts();
      toast.success('Hutang berhasil dihapus');
    } catch (error) {
      console.error('Error deleting debt:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus hutang');
    }
  };

  const handlePayment = async (amount: number, notes?: string) => {
    if (!selectedDebt) return;

    try {
      const response = await fetch(`/api/debts/${selectedDebt.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_paid: amount, notes }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to record payment');
      }

      await fetchDebts();
      toast.success('Pembayaran berhasil dicatat');
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal mencatat pembayaran');
      throw error;
    }
  };

  const handleViewLogs = async (debt: Debt) => {
    try {
      const response = await fetch(`/api/debts/${debt.id}/logs`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch logs');
      }

      setLogs(result.data || []);
      setSelectedDebt(debt);
      setIsLogsOpen(true);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memuat log');
    }
  };

  const handleEdit = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsFormOpen(true);
  };

  const handlePaymentClick = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsPaymentOpen(true);
  };

  const handleFormSubmit = async (data: DebtFormData) => {
    if (selectedDebt) {
      await handleUpdate(data);
    } else {
      await handleCreate(data);
    }
  };

  const handleVerified = () => {
    setIsVerified(true);
  };

  // Show passcode dialog if not verified
  if (!isVerified) {
    return <PasscodeDialog open={true} onVerified={handleVerified} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Daftar Hutang</h1>
        <Button onClick={() => {
          setSelectedDebt(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Hutang Baru
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Memuat...</div>
      ) : (
        <DebtTable
          debts={debts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPayment={handlePaymentClick}
          onViewLogs={handleViewLogs}
          filters={filters}
          onFilterChange={setFilters}
        />
      )}

      <DebtForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedDebt(null);
        }}
        onSubmit={handleFormSubmit}
        debt={selectedDebt}
      />

      <PaymentDialog
        open={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setSelectedDebt(null);
        }}
        onConfirm={handlePayment}
        debt={selectedDebt}
      />

      <DebtLogsDialog
        open={isLogsOpen}
        onClose={() => {
          setIsLogsOpen(false);
          setSelectedDebt(null);
          setLogs([]);
        }}
        logs={logs}
        debtName={selectedDebt?.name || ''}
      />
    </div>
  );
}
