import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenTool, Image, Video, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TagSelector from "./TagSelector";

interface QuickPostProps {
  onPostCreated?: () => void;
}

const QuickPost = ({ onPostCreated }: QuickPostProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [postType, setPostType] = useState<"essay" | "hot_take">("essay");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [hotTakeStatement, setHotTakeStatement] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (postType === "essay") {
        if (!title.trim() || !content.trim()) {
          toast({
            title: "Missing content",
            description: "Please add both a title and content for your post",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from("essays")
          .insert({
            title: title.trim(),
            content: content.trim(),
            excerpt: content.substring(0, 200) + (content.length > 200 ? "..." : ""),
            tags,
            published: true,
            user_id: user.id,
            post_type: "spark"
          });

        if (error) throw error;
      } else {
        if (!hotTakeStatement.trim()) {
          toast({
            title: "Missing statement",
            description: "Please add your hot take statement",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from("hot_takes")
          .insert({
            statement: hotTakeStatement.trim(),
            tags,
            user_id: user.id,
          });

        if (error) throw error;
      }

      toast({
        title: "Post created!",
        description: "Your post has been shared with your followers",
      });

      // Reset form
      setContent("");
      setTitle("");
      setHotTakeStatement("");
      setTags([]);
      
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback>
              {profile?.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Tabs value={postType} onValueChange={(value) => setPostType(value as "essay" | "hot_take")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="essay" className="flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  Spark
                </TabsTrigger>
                <TabsTrigger value="hot_take" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Hot Take
                </TabsTrigger>
              </TabsList>

              <TabsContent value="essay" className="space-y-4">
                <Textarea
                  placeholder="What's your title?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="min-h-[40px] resize-none"
                  maxLength={200}
                />
                <Textarea
                  placeholder="Share your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={2000}
                />
              </TabsContent>

              <TabsContent value="hot_take" className="space-y-4">
                <Textarea
                  placeholder="Share your bold, provocative take that will spark debate..."
                  value={hotTakeStatement}
                  onChange={(e) => setHotTakeStatement(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
              </TabsContent>
            </Tabs>

            <TagSelector
              selectedTags={tags}
              onTagsChange={setTags}
              placeholder="Add tags..."
              maxTags={5}
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" disabled>
                  <Image className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <Video className="w-4 h-4" />
                </Button>
              </div>
              
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickPost;