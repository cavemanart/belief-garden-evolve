import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Repeat2, Share, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HotTake {
  id: string;
  statement: string;
  tags?: string[];
  created_at: string;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  heart_count: number;
  comment_count: number;
  repost_count: number;
  is_hearted: boolean;
}

interface HotTakeCardProps {
  hotTake: HotTake;
  onUpdate?: () => void;
}

const HotTakeCard = ({ hotTake, onUpdate }: HotTakeCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isHearting, setIsHearting] = useState(false);
  const [isReposting, setIsReposting] = useState(false);

  const handleHeart = async () => {
    if (!user || isHearting) return;

    setIsHearting(true);
    try {
      if (hotTake.is_hearted) {
        const { error } = await supabase
          .from('hearts')
          .delete()
          .eq('user_id', user.id)
          .eq('hot_take_id', hotTake.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hearts')
          .insert({
            user_id: user.id,
            hot_take_id: hotTake.id,
          });

        if (error) throw error;
      }

      onUpdate?.();
    } catch (error) {
      console.error('Error toggling heart:', error);
      toast({
        title: "Error",
        description: "Failed to update heart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsHearting(false);
    }
  };

  const handleRepost = async () => {
    if (!user || isReposting) return;

    setIsReposting(true);
    try {
      const { error } = await supabase
        .from('reposts')
        .insert({
          user_id: user.id,
          hot_take_id: hotTake.id,
          comment_text: null,
        });

      if (error) throw error;

      toast({
        title: "Reposted!",
        description: "Hot take shared to your followers",
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error reposting:', error);
      toast({
        title: "Error",
        description: "Failed to repost. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReposting(false);
    }
  };

  return (
    <Card className="hover:shadow-medium transition-all duration-200 border-l-4 border-l-primary/30">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={hotTake.author.avatar_url || ""} />
            <AvatarFallback>
              {hotTake.author.display_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">
                {hotTake.author.display_name}
              </h3>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(hotTake.created_at))} ago
              </span>
              <Flame className="w-4 h-4 text-primary ml-1" />
            </div>

            <div className="text-lg leading-relaxed font-medium text-foreground">
              {hotTake.statement}
            </div>

            {hotTake.tags && hotTake.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hotTake.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHeart}
                  disabled={isHearting}
                  className={`space-x-2 ${
                    hotTake.is_hearted 
                      ? "text-red-500 hover:text-red-600" 
                      : "text-muted-foreground hover:text-red-500"
                  }`}
                >
                  <Heart 
                    className={`w-4 h-4 ${hotTake.is_hearted ? "fill-current" : ""}`} 
                  />
                  <span>{hotTake.heart_count}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="space-x-2 text-muted-foreground hover:text-primary"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{hotTake.comment_count}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRepost}
                  disabled={isReposting}
                  className="space-x-2 text-muted-foreground hover:text-green-600"
                >
                  <Repeat2 className="w-4 h-4" />
                  <span>{hotTake.repost_count}</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotTakeCard;