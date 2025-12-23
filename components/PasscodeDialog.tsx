'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { Lock } from 'phosphor-react';

interface PasscodeDialogProps {
  open: boolean;
  onVerified: () => void;
}

export default function PasscodeDialog({ open, onVerified }: PasscodeDialogProps) {
  const [passcode, setPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passcode.trim()) {
      toast.error('Silakan masukkan passcode');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Passcode salah');
      }

      // Store verification in sessionStorage
      sessionStorage.setItem('debt-list-verified', 'true');
      toast.success('Passcode berhasil diverifikasi');
      onVerified();
      setPasscode('');
    } catch (error) {
      console.error('Error verifying passcode:', error);
      toast.error(error instanceof Error ? error.message : 'Passcode salah');
      setPasscode('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-6 h-6 text-foreground" weight="bold" />
            <DialogTitle>Masukkan Passcode</DialogTitle>
          </div>
          <DialogDescription>
            Halaman ini dilindungi dengan passcode. Silakan masukkan passcode untuk melanjutkan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              type="password"
              placeholder="Masukkan passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              disabled={isVerifying}
              autoFocus
              className="text-center text-lg tracking-widest"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying ? 'Memverifikasi...' : 'Verifikasi'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
