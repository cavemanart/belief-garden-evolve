import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PenTool, Zap, Video, Mic, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TagSelector from "./TagSelector";

interface CreateContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContentCreated?: () => void;
}

type ContentType = "spark" | "hot_take";
type SparkSubtype = "text" | "thread" | "audio" | "video" | "image" | "notes";
type HotTakeSubtype = "text" | "short_video" | "image";

const CreateContentModal = ({ open, onOpenChange, onContentCreated }: CreateContentModalProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"type" | "create">("type");
  const [contentType, setContentType] = useState<ContentType>("spark");
  const [subtype, setSubtype] = useState<SparkSubtype | HotTakeSubtype>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setStep("type");
    setContentType("spark");
    setSubtype("text");
    setTitle("");
    setContent("");
    setTags([]);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleTypeSelect = (type: ContentType, sub: SparkSubtype | HotTakeSubtype) => {
    setContentType(type);
    setSubtype(sub);
    setStep("create");
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (contentType === "spark") {
        if (!title.trim() || !content.trim()) {
          toast({
            title: "Missing content",
            description: "Please add both a title and content for your Spark",
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
        if (!content.trim()) {
          toast({
            title: "Missing statement",
            description: "Please add your Hot Take statement",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from("hot_takes")
          .insert({
            statement: content.trim(),
            tags,
            user_id: user.id,
          });

        if (error) throw error;
      }

      toast({
        title: "Content created!",
        description: `Your ${contentType === "spark" ? "Spark" : "Hot Take"} has been shared`,
      });

      onContentCreated?.();
      handleClose();
    } catch (error) {
      console.error("Error creating content:", error);
      toast({
        title: "Error",
        description: "Failed to create content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sparkOptions = [
    { type: "text" as SparkSubtype, icon: PenTool, label: "Text Post", desc: "Longform, layered ideas" },
    { type: "thread" as SparkSubtype, icon: FileText, label: "Thread", desc: "Expand across multiple points" },
    { type: "audio" as SparkSubtype, icon: Mic, label: "Audio/Podcast", desc: "Voice-led content" },
    { type: "video" as SparkSubtype, icon: Video, label: "Video (Long)", desc: "Visual storytelling, deep dives" },
    { type: "image" as SparkSubtype, icon: ImageIcon, label: "Image + Caption", desc: "Stories with photos" },
    { type: "notes" as SparkSubtype, icon: FileText, label: "Notes/Resources", desc: "Lists, summaries, references" },
  ];

  const hotTakeOptions = [
    { type: "text" as HotTakeSubtype, icon: Zap, label: "Text Post", desc: "Short, punchy, bold opinions" },
    { type: "short_video" as HotTakeSubtype, icon: Video, label: "Short Video", desc: "High-energy, fast reactions" },
    { type: "image" as HotTakeSubtype, icon: ImageIcon, label: "Image + Caption", desc: "Memes, screenshots, viral content" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === "type" ? (
          <>
            <DialogHeader>
              <DialogTitle>What would you like to create?</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Spark Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <PenTool className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold">✨ Spark</h3>
                  <span className="text-sm text-muted-foreground">Thoughtful, layered content</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sparkOptions.map((option) => (
                    <Card
                      key={option.type}
                      className="cursor-pointer hover:bg-accent/5 hover:border-accent/30 transition-colors"
                      onClick={() => handleTypeSelect("spark", option.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <option.icon className="w-5 h-5 text-accent mt-1" />
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Hot Take Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold">🔥 Hot Take</h3>
                  <span className="text-sm text-muted-foreground">Short, bold, provocative</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hotTakeOptions.map((option) => (
                    <Card
                      key={option.type}
                      className="cursor-pointer hover:bg-accent/5 hover:border-accent/30 transition-colors"
                      onClick={() => handleTypeSelect("hot_take", option.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <option.icon className="w-5 h-5 text-accent mt-1" />
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {contentType === "spark" ? <PenTool className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                Create {contentType === "spark" ? "Spark" : "Hot Take"}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStep("type")}
                className="self-start"
              >
                ← Back to selection
              </Button>
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
                  {contentType === "spark" && (
                    <Input
                      placeholder="Title for your Spark..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={200}
                    />
                  )}
                  
                  <Textarea
                    placeholder={
                      contentType === "spark" 
                        ? "Share your thoughtful content..."
                        : "Share your bold, provocative take..."
                    }
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px]"
                    maxLength={contentType === "spark" ? 2000 : 500}
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
                        "Create"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateContentModal;