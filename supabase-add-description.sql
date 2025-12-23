-- ============================================
-- ADD DESCRIPTION FIELD TO EXISTING TABLES
-- ============================================
-- Run this SQL if you already have the tables created
-- and need to add the description field

-- Add description column to debts table
ALTER TABLE debts 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add description column to debt_logs table
ALTER TABLE debt_logs 
ADD COLUMN IF NOT EXISTS description TEXT;
