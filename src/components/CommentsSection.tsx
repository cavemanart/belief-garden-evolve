import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Reply, Heart, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  parent_id: string | null;
  depth: number;
  thread_id: string;
  created_at: string;
  author: {
    display_name: string;
    avatar_url?: string;
  };
  hearts_count: number;
  is_hearted: boolean;
  replies?: Comment[];
}

interface CommentsSectionProps {
  itemId: string;
  itemType: 'essay' | 'belief_card';
  onCommentAdded?: () => void;
}

const CommentsSection = ({ itemId, itemType, onCommentAdded }: CommentsSectionProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const fetchComments = async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          id, content, user_id, parent_id, depth, thread_id, created_at,
          profiles!inner(display_name, avatar_url)
        `)
        .eq(itemType === 'essay' ? 'essay_id' : 'belief_card_id', itemId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get hearts count and user interactions for each comment
      const commentsWithEngagement = await Promise.all(
        (commentsData || []).map(async (comment) => {
          // Get hearts count
          const { count: heartsCount } = await supabase
            .from('hearts')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.id);

          // Check if user has hearted
          let isHearted = false;
          if (user) {
            const { data: userHeart } = await supabase
              .from('hearts')
              .select('id')
              .eq('user_id', user.id)
              .eq('comment_id', comment.id)
              .single();
            
            isHearted = !!userHeart;
          }

          return {
            id: comment.id,
            content: comment.content,
            user_id: comment.user_id,
            parent_id: comment.parent_id,
            depth: comment.depth || 0,
            thread_id: comment.thread_id,
            created_at: comment.created_at,
            author: {
              display_name: (comment.profiles as any)?.display_name || 'Anonymous',
              avatar_url: (comment.profiles as any)?.avatar_url
            },
            hearts_count: heartsCount || 0,
            is_hearted: isHearted
          };
        })
      );

      // Build comment tree
      const commentTree = buildCommentTree(commentsWithEngagement);
      setComments(commentTree);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const buildCommentTree = (comments: any[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // Create map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Build tree structure
    comments.forEach(comment => {
      const commentNode = commentMap.get(comment.id)!;
      
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentNode);
        }
      } else {
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      const commentData = {
        content: newComment.trim(),
        user_id: user.id,
        [itemType === 'essay' ? 'essay_id' : 'belief_card_id']: itemId,
        depth: 0,
      };

      const { error } = await supabase
        .from('comments')
        .insert(commentData);

      if (error) throw error;

      toast({
        description: "Comment added successfully",
      });

      setNewComment('');
      fetchComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Could not add comment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (parentId: string, parentDepth: number) => {
    if (!user || !replyContent.trim()) return;

    setLoading(true);
    try {
      const replyData = {
        content: replyContent.trim(),
        user_id: user.id,
        parent_id: parentId,
        [itemType === 'essay' ? 'essay_id' : 'belief_card_id']: itemId,
        depth: Math.min(parentDepth + 1, 3), // Max depth of 3
      };

      const { error } = await supabase
        .from('comments')
        .insert(replyData);

      if (error) throw error;

      toast({
        description: "Reply added successfully",
      });

      setReplyContent('');
      setReplyTo(null);
      fetchComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Could not add reply",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHeartComment = async (commentId: string, isHearted: boolean) => {
    if (!user) return;

    try {
      if (isHearted) {
        await supabase
          .from('hearts')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
      } else {
        await supabase
          .from('hearts')
          .insert({
            user_id: user.id,
            comment_id: commentId
          });
      }

      fetchComments();
    } catch (error) {
      console.error('Error toggling heart:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [itemId, itemType, user]);

  const renderComment = (comment: Comment, level: number = 0) => (
    <div key={comment.id} className={`${level > 0 ? 'ml-6 border-l border-border/30 pl-4' : ''}`}>
      <Card className="p-4 mb-4 bg-card/50">
        <div className="flex items-start space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.author.avatar_url || ''} />
            <AvatarFallback className="text-xs bg-accent text-accent-foreground">
              {getInitials(comment.author.display_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground">
                {comment.author.display_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>

            <div 
              className="text-sm text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className={`space-x-1 text-xs ${comment.is_hearted ? 'text-red-500' : 'text-muted-foreground'}`}
                onClick={() => handleHeartComment(comment.id, comment.is_hearted)}
              >
                <Heart className={`w-3 h-3 ${comment.is_hearted ? 'fill-current' : ''}`} />
                <span>{comment.hearts_count}</span>
              </Button>

              {user && level < 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="space-x-1 text-xs text-muted-foreground"
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </Button>
              )}
            </div>

            {/* Reply form */}
            {replyTo === comment.id && user && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Write a thoughtful reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id, comment.depth)}
                    disabled={!replyContent.trim() || loading}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map(reply => renderComment(reply, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Add new comment */}
      {user ? (
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                {profile?.display_name ? getInitials(profile.display_name) : 'UN'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share your thoughtful response..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || loading}
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm mb-2">
            Sign in to join the discussion
          </p>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;