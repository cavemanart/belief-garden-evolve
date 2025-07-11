-- Create essays table
CREATE TABLE public.essays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tldr TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create belief_cards table
CREATE TABLE public.belief_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_belief TEXT NOT NULL,
  current_belief TEXT NOT NULL,
  explanation TEXT,
  date_changed DATE DEFAULT CURRENT_DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  essay_id UUID REFERENCES public.essays(id) ON DELETE CASCADE,
  belief_card_id UUID REFERENCES public.belief_cards(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT comment_target_check CHECK (
    (essay_id IS NOT NULL AND belief_card_id IS NULL) OR
    (essay_id IS NULL AND belief_card_id IS NOT NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.belief_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for essays
CREATE POLICY "Published essays are viewable by everyone" 
ON public.essays 
FOR SELECT 
USING (published = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own essays" 
ON public.essays 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own essays" 
ON public.essays 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own essays" 
ON public.essays 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for belief_cards
CREATE POLICY "Belief cards are viewable by everyone" 
ON public.belief_cards 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own belief cards" 
ON public.belief_cards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own belief cards" 
ON public.belief_cards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own belief cards" 
ON public.belief_cards 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_essays_updated_at
  BEFORE UPDATE ON public.essays
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_belief_cards_updated_at
  BEFORE UPDATE ON public.belief_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();