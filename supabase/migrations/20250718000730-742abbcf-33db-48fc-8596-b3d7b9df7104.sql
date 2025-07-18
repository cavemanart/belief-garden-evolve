-- Update the essays table to support new post types: 'spark' and 'ignite'
-- Remove the existing constraint and add new one
ALTER TABLE public.essays 
DROP CONSTRAINT IF EXISTS essays_post_type_check;

ALTER TABLE public.essays 
ADD CONSTRAINT essays_post_type_check 
CHECK (post_type IN ('spark', 'ignite'));

-- Create a new hot_takes table for bold, provocative statements
CREATE TABLE public.hot_takes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  statement text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hot_takes ENABLE ROW LEVEL SECURITY;

-- Create policies for hot_takes
CREATE POLICY "Hot takes are viewable by everyone" 
ON public.hot_takes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own hot takes" 
ON public.hot_takes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hot takes" 
ON public.hot_takes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hot takes" 
ON public.hot_takes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_hot_takes_updated_at
BEFORE UPDATE ON public.hot_takes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update hearts table to support hot_takes
ALTER TABLE public.hearts 
ADD COLUMN hot_take_id uuid;

-- Update reposts table to support hot_takes  
ALTER TABLE public.reposts 
ADD COLUMN hot_take_id uuid;

-- Update comments table to support hot_takes
ALTER TABLE public.comments 
ADD COLUMN hot_take_id uuid;