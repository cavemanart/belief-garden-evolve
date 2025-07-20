import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TagSelector from "./TagSelector";

interface CreateHotTakeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContentCreated?: () => void;
  subtype: string;
}

const CreateHotTakeModal = ({ open, onOpenChange, onContentCreated, subtype }: CreateHotTakeModalProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
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

    if (!content.trim()) {
      toast({
        title: "Missing statement",
        description: "Please add your Hot Take statement",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("hot_takes")
        .insert({
          statement: content.trim(),
          tags,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Hot Take created!",
        description: "Your Hot Take has been shared",
      });

      onContentCreated?.();
      handleClose();
    } catch (error) {
      console.error("Error creating hot take:", error);
      toast({
        title: "Error",
        description: "Failed to create Hot Take. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubtypeLabel = (type: string) => {
    switch (type) {
      case "text": return "Text Post";
      case "short_video": return "Short Video";
      case "image": return "Image + Caption";
      default: return "Hot Take";
    }
  };

  const getPlaceholder = (type: string) => {
    switch (type) {
      case "short_video": return "Share your quick video reaction or hot take...";
      case "image": return "Drop your hottest take with an image...";
      default: return "Share your bold, provocative take...";
    }
  };

  const getMaxLength = (type: string) => {
    switch (type) {
      case "image": return 300;
      default: return 500;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
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
              <Textarea
                placeholder={getPlaceholder(subtype)}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px]"
                maxLength={getMaxLength(subtype)}
              />
              
              <TagSelector
                selectedTags={tags}
                onTagsChange={setTags}
                placeholder="Add tags..."
                maxTags={3}
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
                    "Share Hot Take"
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

export default CreateHotTakeModal;