-- Add new fields to essays table for enhanced post types
ALTER TABLE public.essays 
ADD COLUMN post_type TEXT DEFAULT 'long-form' CHECK (post_type IN ('long-form', 'short-insight')),
ADD COLUMN email_subscribers BOOLEAN DEFAULT false,
ADD COLUMN paid_only BOOLEAN DEFAULT false,
ADD COLUMN excerpt TEXT,
ADD COLUMN image_urls TEXT[] DEFAULT '{}';

-- Add profile completion tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_completed BOOLEAN DEFAULT false,
ADD COLUMN onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true);

-- Create policies for profile photo uploads
CREATE POLICY "Profile images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);