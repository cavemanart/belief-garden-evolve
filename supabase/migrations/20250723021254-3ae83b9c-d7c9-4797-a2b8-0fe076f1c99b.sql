-- Create podcasts table for podcast series
CREATE TABLE public.podcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  category TEXT,
  language TEXT DEFAULT 'en',
  explicit BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create episodes table for individual podcast episodes
CREATE TABLE public.episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  audio_url TEXT,
  external_audio_url TEXT,
  duration INTEGER, -- in seconds
  episode_number INTEGER,
  season_number INTEGER DEFAULT 1,
  published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Create policies for podcasts
CREATE POLICY "Published podcasts are viewable by everyone" 
ON public.podcasts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own podcasts" 
ON public.podcasts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcasts" 
ON public.podcasts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own podcasts" 
ON public.podcasts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for episodes
CREATE POLICY "Published episodes are viewable by everyone" 
ON public.episodes 
FOR SELECT 
USING (published = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own episodes" 
ON public.episodes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episodes" 
ON public.episodes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own episodes" 
ON public.episodes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_podcasts_updated_at
BEFORE UPDATE ON public.podcasts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at
BEFORE UPDATE ON public.episodes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_podcasts_user_id ON public.podcasts(user_id);
CREATE INDEX idx_episodes_podcast_id ON public.episodes(podcast_id);
CREATE INDEX idx_episodes_user_id ON public.episodes(user_id);
CREATE INDEX idx_episodes_published ON public.episodes(published);
CREATE INDEX idx_episodes_publish_date ON public.episodes(publish_date);