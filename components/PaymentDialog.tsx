'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import CurrencyInput from '@/components/CurrencyInput';
import { Debt } from '@/types';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number, notes?: string) => Promise<void>;
  debt: Debt | null;
}

export default function PaymentDialog({ open, onClose, onConfirm, debt }: PaymentDialogProps) {
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(amount, notes);
      setAmount(0);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount(0);
    setNotes('');
    onClose();
  };

  const maxAmount = debt ? debt.remaining_amount : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Pembayaran</DialogTitle>
          <DialogDescription>
            Catat pembayaran untuk {debt?.name}. Sisa hutang: {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(maxAmount)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Pembayaran</Label>
            <CurrencyInput
              id="amount"
              placeholder="0"
              value={amount}
              onChange={(value) => setAmount(value)}
            />
            {maxAmount > 0 && (
              <p className="text-xs text-muted-foreground">
                Maksimal: {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(maxAmount)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Input
              id="notes"
              placeholder="Catatan pembayaran..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !amount || parseFloat(amount.toString()) <= 0}>
            {isSubmitting ? 'Mencatat...' : 'Catat Pembayaran'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
