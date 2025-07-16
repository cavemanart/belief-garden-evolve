import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat,
  MoreHorizontal,
  Clock,
  Tag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CommentsSection from "@/components/CommentsSection";
import { formatDistanceToNow } from "date-fns";

interface FeedPost {
  id: string;
  type: "essay" | "belief_card" | "repost";
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
  const [isReposting, setIsReposting] = useState(false);
  const [repostComment, setRepostComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [heartLoading, setHeartLoading] = useState(false);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleHeart = async () => {
    if (!user || heartLoading) return;

    setHeartLoading(true);
    try {
      const heartTable = post.type === "essay" ? "essay_id" : "belief_card_id";

      if (post.is_hearted) {
        await supabase
          .from("hearts")
          .delete()
          .eq("user_id", user.id)
          .eq(heartTable, post.id);

        toast({ description: "Heart removed" });
      } else {
        await supabase.from("hearts").insert({
          user_id: user.id,
          [heartTable]: post.id,
        });

        toast({ description: "Heart added" });
      }

      onUpdate();
    } catch (error) {
      console.error("Error toggling heart:", error);
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
        ...(post.type === "essay"
          ? { essay_id: post.id }
          : { belief_card_id: post.id }),
      };

      await supabase.from("reposts").insert(repostData);

      toast({ description: "Post shared with your followers" });

      setIsReposting(false);
      setRepostComment("");
      onUpdate();
    } catch (error) {
      console.error("Error reposting:", error);
      toast({
        title: "Error",
        description: "Could not share post",
        variant: "destructive",
      });
    }
  };

  const handleSaveToReadingList = async () => {
    if (!user) return;

    const { error } = await supabase.from("reading_list").insert({
      user_id: user.id,
      essay_id: post.id,
    });

    if (error) {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Saved to your reading list!",
      });
    }
  };

  const handleFollowUser = async () => {
    if (!user || !post?.author?.id) return;

    const { error } = await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: post.author.id,
    });

    if (error) {
      toast({
        title: "Failed to follow",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: `You're now following ${post.author.display_name}`,
      });
    }
  };

  const handleReportPost = async () => {
    toast({
      title: "Reported!",
      description: "Thank you for helping keep this space safe.",
    });

    // Optional: log report to `reports` table
  };

  const renderContent = () => {
    if (post.type === "essay") {
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {post.content.tags?.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center text-xs text-accent-foreground bg-accent/20 px-2 py-1 rounded-full"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>

          <h2 className="text-xl font-bold text-foreground font-reading leading-tight">
            {post.content.title}
          </h2>

          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {post.content.excerpt ||
              post.content.content?.substring(0, 200) + "..."}
          </p>

          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              {Math.ceil((post.content.content?.length || 0) / 200)} min read
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              Belief Evolution
            </span>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Before
                </span>
              </div>
              <p className="text-sm text-foreground/80 italic leading-relaxed">
                "{post.content.previous_belief}"
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-4 h-0.5 bg-gradient-to-r from-muted-foreground to-success"></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs uppercase tracking-wide text-success">
                  Now
                </span>
              </div>
              <p className="text-sm text-foreground font-medium leading-relaxed">
                "{post.content.current_belief}"
              </p>
            </div>

            {post.content.explanation && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {post.content.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="p-6 hover:shadow-medium transition-all duration-200 bg-card border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.avatar_url || ""} />
            <AvatarFallback className="text-sm bg-accent text-accent-foreground">
              {getInitials(post.author.display_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{post.author.display_name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {post.type === "essay" && (
              <DropdownMenuItem onClick={handleSaveToReadingList}>
                Save to reading list
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleFollowUser}>
              Follow {post.author.display_name}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReportPost}>
              Report content
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-6">{renderContent()}</div>

      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            className={`space-x-2 ${post.is_hearted ? "text-red-500" : "text-muted-foreground"}`}
            onClick={handleHeart}
            disabled={heartLoading}
          >
            <Heart className={`w-4 h-4 ${post.is_hearted ? "fill-current" : ""}`} />
            <span>{post.hearts_count}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="space-x-2 text-muted-foreground"
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
                  className="space-x-2 text-muted-foreground"
                >
                  <Repeat className="w-4 h-4" />
                  <span>{post.reposts_count}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share this post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add your thoughts (optional)..."
                    value={repostComment}
                    onChange={(e) => setRepostComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsReposting(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleRepost}>Share</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          {post.type === "essay" ? "Essay" : "Belief Evolution"}
        </div>
      </div>

      {showComments && (
        <div className="mt-6 pt-6 border-t border-border/30">
          <CommentsSection
            itemId={post.id}
            itemType={post.type === "repost" ? "essay" : post.type}
            onCommentAdded={onUpdate}
          />
        </div>
      )}
    </Card>
  );
};

export default FeedPostCard;
