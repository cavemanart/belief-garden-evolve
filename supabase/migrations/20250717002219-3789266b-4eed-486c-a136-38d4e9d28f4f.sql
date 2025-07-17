-- Add foreign key constraints between essays/belief_cards and profiles
-- This will enable proper joins in the application

-- Add foreign key for essays -> profiles
ALTER TABLE public.essays 
ADD CONSTRAINT fk_essays_profiles 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;

-- Add foreign key for belief_cards -> profiles  
ALTER TABLE public.belief_cards 
ADD CONSTRAINT fk_belief_cards_profiles 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;