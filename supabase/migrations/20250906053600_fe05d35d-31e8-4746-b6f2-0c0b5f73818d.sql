-- Add settings columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS interview_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS resume_optimization_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS profile_visibility BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_analytics BOOLEAN DEFAULT true;