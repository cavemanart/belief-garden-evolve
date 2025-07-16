-- Add foreign key constraints to properly link tables to profiles
-- This will enable Supabase's join syntax and fix the 400 errors

-- Add foreign key for essays table
ALTER TABLE public.essays 
ADD CONSTRAINT fk_essays_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key for belief_cards table  
ALTER TABLE public.belief_cards
ADD CONSTRAINT fk_belief_cards_profiles
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key for comments table
ALTER TABLE public.comments
ADD CONSTRAINT fk_comments_profiles  
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key for hearts table
ALTER TABLE public.hearts
ADD CONSTRAINT fk_hearts_profiles
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key for reposts table  
ALTER TABLE public.reposts
ADD CONSTRAINT fk_reposts_profiles
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key for follows table (follower)
ALTER TABLE public.follows
ADD CONSTRAINT fk_follows_follower_profiles
FOREIGN KEY (follower_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key for follows table (following)  
ALTER TABLE public.follows
ADD CONSTRAINT fk_follows_following_profiles
FOREIGN KEY (following_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;