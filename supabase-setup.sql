-- ============================================
-- SUPABASE DATABASE SETUP FOR DEBT LIST
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Go to: Supabase Dashboard → SQL Editor → New Query

-- ============================================
-- 1. CREATE DEBTS TABLE
-- ============================================
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

-- ============================================
-- 2. CREATE DEBT_LOGS TABLE
-- ============================================
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

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_name ON debts(name);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts(due_date);
CREATE INDEX IF NOT EXISTS idx_debts_created_at ON debts(created_at);
CREATE INDEX IF NOT EXISTS idx_debt_logs_debt_id ON debt_logs(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_logs_created_at ON debt_logs(created_at);

-- ============================================
-- 4. CREATE FUNCTION FOR AUTO-UPDATE TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 5. CREATE TRIGGER FOR AUTO-UPDATE
-- ============================================
CREATE TRIGGER update_debts_updated_at 
  BEFORE UPDATE ON debts
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE POLICIES
-- ============================================
-- OPTION A: Public Access (for development/testing)
-- Uncomment the lines below if you want public access

CREATE POLICY "Allow public access to debts" ON debts
  FOR ALL USING (true);

CREATE POLICY "Allow public access to debt_logs" ON debt_logs
  FOR ALL USING (true);

-- OPTION B: Authenticated Users Only (for production)
-- Uncomment the lines below and comment out Option A for production

-- CREATE POLICY "Allow all operations for authenticated users" ON debts
--   FOR ALL USING (auth.role() = 'authenticated');
--
-- CREATE POLICY "Allow all operations for authenticated users" ON debt_logs
--   FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- VERIFICATION QUERIES (Optional)
-- ============================================
-- Run these to verify the setup:

-- Check if tables exist:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('debts', 'debt_logs');

-- Check if indexes exist:
-- SELECT indexname FROM pg_indexes 
-- WHERE tablename IN ('debts', 'debt_logs');

-- Check if policies exist:
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('debts', 'debt_logs');
