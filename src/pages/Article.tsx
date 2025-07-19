import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Tag, Heart, MessageCircle, User, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import CommentsSection from '@/components/CommentsSection';
import { formatDistanceToNow } from 'date-fns';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  tldr?: string;
  tags: string[];
  post_type: string;
  created_at: string;
  hearts_count: number;
  comments_count: number;
  is_hearted: boolean;
  profiles: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

const Article = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [heartLoading, setHeartLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const fetchArticle = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('essays')
        .select(`
          *,
          profiles!inner (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .eq('published', true)
        .single();

      if (error) throw error;

      // Get heart and comment counts separately
      const [heartsResult, commentsResult, userHeartResult] = await Promise.all([
        supabase.from('hearts').select('id', { count: 'exact' }).eq('essay_id', data.id),
        supabase.from('comments').select('id', { count: 'exact' }).eq('essay_id', data.id),
        user ? supabase.from('hearts').select('id').eq('essay_id', data.id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null })
      ]);

      setArticle({
        ...data,
        hearts_count: heartsResult.count || 0,
        comments_count: commentsResult.count || 0,
        is_hearted: !!userHeartResult.data,
        profiles: data.profiles[0]
      });
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: "Error",
        description: "Could not load article",
        variant: "destructive",
      });
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  const handleHeart = async () => {
    if (!user || !article || heartLoading) return;

    setHeartLoading(true);
    try {
      if (article.is_hearted) {
        await supabase
          .from('hearts')
          .delete()
          .eq('user_id', user.id)
          .eq('essay_id', article.id);
      } else {
        await supabase
          .from('hearts')
          .insert({
            user_id: user.id,
            essay_id: article.id
          });
      }
      
      fetchArticle();
    } catch (error) {
      console.error('Error toggling heart:', error);
      toast({
        title: "Error",
        description: "Could not update heart",
        variant: "destructive",
      });
    } finally {
      setHeartLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">Loading article...</div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">Article not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 pt-24">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="p-8">
          {/* Author info */}
          <div className="flex items-center space-x-3 mb-6">
            <Avatar className="w-12 h-12">
              <AvatarImage src={article.profiles.avatar_url || ''} />
              <AvatarFallback className="bg-accent text-accent-foreground">
                {getInitials(article.profiles.display_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{article.profiles.display_name}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center text-xs text-accent-foreground bg-accent/20 px-2 py-1 rounded-full"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Article content */}
          <article className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold mb-6 text-foreground">{article.title}</h1>
            
            {article.tldr && (
              <div className="bg-muted p-4 rounded-lg mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  TL;DR
                </h3>
                <p className="text-base">{article.tldr}</p>
              </div>
            )}

            {article.excerpt && (
              <div className="text-lg text-muted-foreground mb-6 italic">
                {article.excerpt}
              </div>
            )}

            <div className="whitespace-pre-wrap leading-relaxed text-foreground">
              {article.content}
            </div>

            {/* Reading time */}
            <div className="flex items-center text-sm text-muted-foreground mt-8 pt-4 border-t">
              <Clock className="w-4 h-4 mr-1" />
              <span>
                {Math.ceil((article.content?.length || 0) / 200)} min read
              </span>
            </div>
          </article>

          {/* Interaction buttons */}
          <div className="flex items-center space-x-6 mt-8 pt-6 border-t border-border/30">
            <Button
              variant="ghost"
              size="sm"
              className={`space-x-2 ${article.is_hearted ? 'text-red-500' : 'text-muted-foreground'}`}
              onClick={handleHeart}
              disabled={heartLoading}
            >
              <Heart className={`w-4 h-4 ${article.is_hearted ? 'fill-current' : ''}`} />
              <span>{article.hearts_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="space-x-2 text-muted-foreground"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{article.comments_count}</span>
            </Button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-6 pt-6 border-t border-border/30">
              <CommentsSection 
                itemId={article.id}
                itemType="essay"
                onCommentAdded={fetchArticle}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Article;