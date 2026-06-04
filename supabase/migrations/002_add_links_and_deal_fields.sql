-- Migration: Add new fields to developers and companies tables
-- Run this in Supabase SQL Editor

-- Add new developer fields
ALTER TABLE developers ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS deal_amount DECIMAL(12,2);

-- Add new company fields
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_url TEXT;
