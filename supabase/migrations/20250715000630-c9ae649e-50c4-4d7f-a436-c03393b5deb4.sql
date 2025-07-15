-- Add hearts/likes table
CREATE TABLE public.hearts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    essay_id UUID NULL,
    belief_card_id UUID NULL,
    comment_id UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT hearts_user_essay_unique UNIQUE(user_id, essay_id),
    CONSTRAINT hearts_user_belief_unique UNIQUE(user_id, belief_card_id),
    CONSTRAINT hearts_user_comment_unique UNIQUE(user_id, comment_id),
    CONSTRAINT hearts_target_check CHECK (
        (essay_id IS NOT NULL AND belief_card_id IS NULL AND comment_id IS NULL) OR
        (essay_id IS NULL AND belief_card_id IS NOT NULL AND comment_id IS NULL) OR
        (essay_id IS NULL AND belief_card_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Add reposts table
CREATE TABLE public.reposts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    essay_id UUID NULL,
    belief_card_id UUID NULL,
    comment_text TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT reposts_target_check CHECK (
        (essay_id IS NOT NULL AND belief_card_id IS NULL) OR
        (essay_id IS NULL AND belief_card_id IS NOT NULL)
    )
);

-- Add following/followers table
CREATE TABLE public.follows (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL,
    following_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT follows_unique UNIQUE(follower_id, following_id),
    CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id)
);

-- Enable Row Level Security
ALTER TABLE public.hearts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hearts
CREATE POLICY "Hearts are viewable by everyone" 
ON public.hearts FOR SELECT USING (true);

CREATE POLICY "Users can create hearts" 
ON public.hearts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hearts" 
ON public.hearts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reposts
CREATE POLICY "Reposts are viewable by everyone" 
ON public.reposts FOR SELECT USING (true);

CREATE POLICY "Users can create reposts" 
ON public.reposts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reposts" 
ON public.reposts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reposts" 
ON public.reposts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for follows
CREATE POLICY "Follows are viewable by everyone" 
ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others" 
ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" 
ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_reposts_updated_at
BEFORE UPDATE ON public.reposts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_hearts_user_id ON public.hearts(user_id);
CREATE INDEX idx_hearts_essay_id ON public.hearts(essay_id);
CREATE INDEX idx_hearts_belief_card_id ON public.hearts(belief_card_id);
CREATE INDEX idx_hearts_comment_id ON public.hearts(comment_id);

CREATE INDEX idx_reposts_user_id ON public.reposts(user_id);
CREATE INDEX idx_reposts_essay_id ON public.reposts(essay_id);
CREATE INDEX idx_reposts_belief_card_id ON public.reposts(belief_card_id);
CREATE INDEX idx_reposts_created_at ON public.reposts(created_at DESC);

CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);

-- Update comments table to support better threading
ALTER TABLE public.comments ADD COLUMN depth INTEGER DEFAULT 0;
ALTER TABLE public.comments ADD COLUMN thread_id UUID;

-- Update thread_id to be the root comment id for threading
UPDATE public.comments SET thread_id = id WHERE parent_id IS NULL;
UPDATE public.comments SET thread_id = (
    WITH RECURSIVE comment_tree AS (
        SELECT id, parent_id, id as root_id
        FROM public.comments 
        WHERE parent_id IS NULL
        
        UNION ALL
        
        SELECT c.id, c.parent_id, ct.root_id
        FROM public.comments c
        JOIN comment_tree ct ON c.parent_id = ct.id
    )
    SELECT root_id FROM comment_tree WHERE comment_tree.id = comments.id
) WHERE thread_id IS NULL;