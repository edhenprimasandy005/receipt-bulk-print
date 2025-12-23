'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DebtLog } from '@/types';
import { format } from 'date-fns';

interface DebtLogsDialogProps {
  open: boolean;
  onClose: () => void;
  logs: DebtLog[];
  debtName: string;
}

export default function DebtLogsDialog({ open, onClose, logs, debtName }: DebtLogsDialogProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const getActionLabel = (action: DebtLog['action']) => {
    switch (action) {
      case 'create':
        return 'BUAT';
      case 'update':
        return 'PERBARUI';
      case 'payment':
        return 'PEMBAYARAN';
      case 'delete':
        return 'HAPUS';
      default:
        return (action as string).toUpperCase();
    }
  };

  const getActionColor = (action: DebtLog['action']) => {
    switch (action) {
      case 'create':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'update':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'payment':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Hutang - {debtName}</DialogTitle>
          <DialogDescription>Riwayat semua aksi untuk hutang ini</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Tidak ada log ditemukan</p>
          ) : (
            logs.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">{formatDate(log.created_at)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {log.amount_paid && (
                    <p className="text-sm">
                      <strong>Jumlah Dibayar:</strong> {formatCurrency(log.amount_paid)}
                    </p>
                  )}
                  {log.description && (
                    <p className="text-sm">
                      <strong>Deskripsi:</strong> {log.description}
                    </p>
                  )}
                  {log.notes && (
                    <p className="text-sm">
                      <strong>Catatan:</strong> {log.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
