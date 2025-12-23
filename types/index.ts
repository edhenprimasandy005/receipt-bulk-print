export interface ProcessedImage {
  id: string;
  file: File;
  preview: string;
  isPdf: boolean;
}

export interface Debt {
  id: string;
  name: string;
  description?: string | null;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  due_date: string | null;
  paid_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DebtLog {
  id: string;
  debt_id: string;
  action: 'create' | 'update' | 'payment' | 'delete';
  old_value?: Partial<Debt>;
  new_value?: Partial<Debt>;
  amount_paid?: number;
  notes?: string;
  description?: string | null;
  created_at: string;
}

export interface DebtFormData {
  name: string;
  description?: string;
  amount: number;
  paid_amount?: number;
  due_date?: string;
  status?: Debt['status'];
}
