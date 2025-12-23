-- Create debts table
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create debt_logs table
CREATE TABLE IF NOT EXISTS debt_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'payment', 'delete')),
  old_value JSONB,
  new_value JSONB,
  amount_paid DECIMAL(15, 2),
  notes TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_name ON debts(name);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts(due_date);
CREATE INDEX IF NOT EXISTS idx_debts_created_at ON debts(created_at);
CREATE INDEX IF NOT EXISTS idx_debt_logs_debt_id ON debt_logs(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_logs_created_at ON debt_logs(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - adjust policies based on your needs
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (example: allow all operations for authenticated users)
-- Adjust these policies based on your authentication setup
CREATE POLICY "Allow all operations for authenticated users" ON debts
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON debt_logs
  FOR ALL USING (true);

-- If you want to allow public access (for development), use:
-- CREATE POLICY "Allow public access" ON debts FOR ALL USING (true);
-- CREATE POLICY "Allow public access" ON debt_logs FOR ALL USING (true);
