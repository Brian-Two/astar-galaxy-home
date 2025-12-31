-- Add stars column to profiles with default 50
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stars integer NOT NULL DEFAULT 50;