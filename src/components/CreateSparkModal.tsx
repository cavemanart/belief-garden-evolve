import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PenTool, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TagSelector from "./TagSelector";

interface CreateSparkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContentCreated?: () => void;
  subtype: string;
}

const CreateSparkModal = ({ open, onOpenChange, onContentCreated, subtype }: CreateSparkModalProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags([]);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing content",
        description: "Please add both a title and content for your Spark",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("essays")
        .insert({
          title: title.trim(),
          content: content.trim(),
          excerpt: content.substring(0, 200) + (content.length > 200 ? "..." : ""),
          tags,
          published: true,
          user_id: user.id,
          post_type: subtype
        });

      if (error) throw error;

      toast({
        title: "Spark created!",
        description: "Your Spark has been shared",
      });

      onContentCreated?.();
      handleClose();
    } catch (error) {
      console.error("Error creating spark:", error);
      toast({
        title: "Error",
        description: "Failed to create Spark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubtypeLabel = (type: string) => {
    switch (type) {
      case "text": return "Text Post";
      case "thread": return "Thread";
      case "audio": return "Audio/Podcast";
      case "video": return "Video (Long)";
      case "image": return "Image + Caption";
      case "notes": return "Notes/Resources";
      default: return "Spark";
    }
  };

  const getPlaceholder = (type: string) => {
    switch (type) {
      case "thread": return "Start your thread here. Use paragraph breaks to separate points...";
      case "audio": return "Describe your audio content, add timestamps, or share key insights...";
      case "video": return "Describe your video content, add chapters, or share key moments...";
      case "image": return "Share the story behind your image...";
      case "notes": return "Share your notes, resources, or reference materials...";
      default: return "Share your thoughtful content...";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Create {getSubtypeLabel(subtype)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback>
                {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <Input
                placeholder={`Title for your ${getSubtypeLabel(subtype)}...`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
              
              <Textarea
                placeholder={getPlaceholder(subtype)}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px]"
                maxLength={2000}
              />
              
              <TagSelector
                selectedTags={tags}
                onTagsChange={setTags}
                placeholder="Add tags..."
                maxTags={5}
              />
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Spark"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSparkModal;