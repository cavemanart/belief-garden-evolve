import { useState } from "react";
import { Heart, MessageCircle, Repeat, MoreHorizontal, Clock, Tag, Flame, Edit, Bookmark, User, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CommentsSection from "@/components/CommentsSection";
import { formatDistanceToNow } from "date-fns";

interface FeedPost {
  id: string;
  type: 'essay' | 'hot_take' | 'repost';
  content: any;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  created_at: string;
  hearts_count: number;
  comments_count: number;
  reposts_count: number;
  is_hearted: boolean;
  repost_comment?: string;
  original_author?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface FeedPostCardProps {
  post: FeedPost;
  onUpdate: () => void;
}

const FeedPostCard = ({ post, onUpdate }: FeedPostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isReposting, setIsReposting] = useState(false);
  const [repostComment, setRepostComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [heartLoading, setHeartLoading] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleHeart = async () => {
    if (!user || heartLoading) return;

    setHeartLoading(true);
    try {
      const heartTable = post.type === 'essay' ? 'essay_id' : 'hot_take_id';
      
      if (post.is_hearted) {
        // Remove heart
        await supabase
          .from('hearts')
          .delete()
          .eq('user_id', user.id)
          .eq(heartTable, post.id);
        
        toast({
          description: "Heart removed",
        });
      } else {
        // Add heart
        await supabase
          .from('hearts')
          .insert({
            user_id: user.id,
            [heartTable]: post.id
          });
        
        toast({
          description: "Heart added",
        });
      }
      
      onUpdate();
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

  const handleRepost = async () => {
    if (!user) return;

    try {
      const repostData = {
        user_id: user.id,
        comment_text: repostComment.trim() || null,
        ...(post.type === 'essay' ? { essay_id: post.id } : { hot_take_id: post.id })
      };

      await supabase
        .from('reposts')
        .insert(repostData);

      toast({
        description: "Post shared with your followers",
      });
      
      setIsReposting(false);
      setRepostComment('');
      onUpdate();
    } catch (error) {
      console.error('Error reposting:', error);
      toast({
        title: "Error",
        description: "Could not share post",
        variant: "destructive",
      });
    }
  };

  const handleSaveToReadingList = async () => {
    if (!user || post.type !== 'essay') return;

    try {
      await supabase
        .from('reading_list')
        .insert({
          user_id: user.id,
          essay_id: post.id
        });

      toast({
        description: "Added to reading list",
      });
    } catch (error) {
      console.error('Error adding to reading list:', error);
      toast({
        title: "Error",
        description: "Could not add to reading list",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async () => {
    if (!user || user.id === post.author.id) return;

    try {
      await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: post.author.id
        });

      toast({
        description: `Now following ${post.author.display_name}`,
      });
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Could not follow user",
        variant: "destructive",
      });
    }
  };

  const renderMediaContent = (imageUrls: string[]) => {
    if (!imageUrls || imageUrls.length === 0) return null;

    return (
      <div className="mt-4 space-y-2">
        {imageUrls.map((url, index) => {
          const isVideo = url.includes('/videos/') || url.match(/\.(mp4|webm|mov)$/i);
          const isAudio = url.includes('/audio/') || url.match(/\.(mp3|wav|ogg)$/i);
          
          if (isVideo) {
            return (
              <div key={index} className="relative">
                <video
                  controls
                  className="w-full max-h-80 rounded-lg"
                  poster={url + '?thumbnail=true'}
                >
                  <source src={url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            );
          } else if (isAudio) {
            return (
              <div key={index} className="bg-muted p-4 rounded-lg">
                <audio controls className="w-full">
                  <source src={url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            );
          } else {
            return (
              <img
                key={index}
                src={url}
                alt={`Post media ${index + 1}`}
                className="w-full max-h-80 object-cover rounded-lg cursor-pointer"
                onClick={() => window.open(url, '_blank')}
              />
            );
          }
        })}
      </div>
    );
  };

  const renderContent = () => {
    if (post.type === 'essay') {
      return (
        <div className="flex gap-6 group cursor-pointer" onClick={() => navigate(`/article/${post.id}`)}>
          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              {post.content.tags?.slice(0, 3).map((tag: string, index: number) => (
                <span 
                  key={index}
                  className="inline-flex items-center text-xs text-accent-foreground bg-accent/20 px-2 py-1 rounded-full border border-accent/30"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
            
            <h2 className="text-xl font-bold text-foreground font-reading leading-tight group-hover:text-accent transition-colors">
              {post.content.title}
            </h2>
            
            <p className="text-muted-foreground leading-relaxed line-clamp-2">
              {post.content.excerpt || post.content.content?.substring(0, 200) + '...'}
            </p>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              <span>
                {Math.ceil((post.content.content?.length || 0) / 200)} min read
              </span>
            </div>

            {/* Display media content */}
            {renderMediaContent(post.content.image_urls)}
          </div>

          {/* Thumbnail */}
          <div className="w-32 h-24 bg-muted/20 rounded-lg border border-accent/20 flex-shrink-0 flex items-center justify-center group-hover:border-accent/40 transition-colors">
            <div className="text-muted-foreground text-center">
              {post.content.post_type === 'spark' ? (
                <>
                  <Flame className="w-6 h-6 mx-auto mb-1 text-accent/60" />
                  <p className="text-xs">Spark</p>
                </>
              ) : (
                <>
                  <Tag className="w-6 h-6 mx-auto mb-1 text-accent/60" />
                  <p className="text-xs">Essay</p>
                </>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full border border-accent/30">
                Hot Take
              </span>
            </div>
          </div>

          <div className="space-y-3 cursor-pointer" onClick={() => navigate(`/article/${post.id}`)}>
            <p className="text-lg font-medium text-foreground leading-relaxed hover:text-accent transition-colors">
              {post.content.statement}
            </p>

            {post.content.tags && post.content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.content.tags.slice(0, 5).map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center text-xs text-accent-foreground bg-accent/20 px-2 py-1 rounded-full border border-accent/30"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Display media content for hot takes if they have media */}
            {post.content.image_urls && renderMediaContent(post.content.image_urls)}
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="p-6 hover:shadow-large transition-all duration-300 bg-card border-accent/20 hover:border-accent/40 red-accent-border">
      {/* Author header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 border-2 border-accent/30 hover:border-accent/60 transition-colors">
            <AvatarImage src={post.author.avatar_url || ''} />
            <AvatarFallback className="text-sm bg-accent/20 text-accent-foreground border border-accent/30">
              {getInitials(post.author.display_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground hover:text-accent transition-colors cursor-pointer">
              {post.author.display_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/10">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            {user && user.id === post.author.id ? (
              <DropdownMenuItem onClick={() => navigate(`/write?edit=${post.id}`)} className="hover:bg-accent/10">
                <Edit className="w-4 h-4 mr-2" />
                Edit {post.type === 'essay' ? 'Article' : 'Hot Take'}
              </DropdownMenuItem>
            ) : (
              <>
                {post.type === 'essay' && (
                  <DropdownMenuItem onClick={handleSaveToReadingList} className="hover:bg-accent/10">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save to reading list
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleFollow} className="hover:bg-accent/10">
                  <User className="w-4 h-4 mr-2" />
                  Follow {post.author.display_name}
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-destructive/10 text-destructive">
                  Report content
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post content */}
      <div className="mb-6">
        {renderContent()}
      </div>

      {/* Interaction buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            className={`space-x-2 hover:bg-accent/10 ${post.is_hearted ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
            onClick={handleHeart}
            disabled={heartLoading}
          >
            <Heart className={`w-4 h-4 ${post.is_hearted ? 'fill-current' : ''}`} />
            <span>{post.hearts_count}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="space-x-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments_count}</span>
          </Button>

          {user && (
            <Dialog open={isReposting} onOpenChange={setIsReposting}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="space-x-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
                >
                  <Repeat className="w-4 h-4" />
                  <span>{post.reposts_count}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Share this post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add your thoughts (optional)..."
                    value={repostComment}
                    onChange={(e) => setRepostComment(e.target.value)}
                    className="min-h-[100px] bg-secondary border-border focus:border-accent"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsReposting(false)} className="border-border hover:bg-accent/10">
                      Cancel
                    </Button>
                    <Button onClick={handleRepost} className="bg-accent hover:bg-accent/90">
                      Share
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          {post.type === 'essay' 
            ? (post.content.post_type === 'spark' ? 'Spark' : 'Essay')
            : 'Hot Take'
          }
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-6 pt-6 border-t border-border/30">
          <CommentsSection 
            itemId={post.id}
            itemType={post.type === 'repost' ? 'essay' : post.type}
            onCommentAdded={onUpdate}
          />
        </div>
      )}
    </Card>
  );
};

export default FeedPostCard;
