import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PenTool, Loader2, Type, MessageSquare, Mic, Video, Image, BookOpen, Plus, X } from "lucide-react";
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
  
  // Additional fields for different content types
  const [threadParts, setThreadParts] = useState<string[]>([""]);
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [audioDescription, setAudioDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [noteItems, setNoteItems] = useState<{heading: string, content: string}[]>([{heading: "", content: ""}]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags([]);
    setIsSubmitting(false);
    setThreadParts([""]);
    setEpisodeTitle("");
    setAudioDescription("");
    setVideoUrl("");
    setThumbnailUrl("");
    setImageUrl("");
    setCaption("");
    setNoteItems([{heading: "", content: ""}]);
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

  const getSubtypeIcon = (type: string) => {
    switch (type) {
      case "text": return Type;
      case "thread": return MessageSquare;
      case "audio": return Mic;
      case "video": return Video;
      case "image": return Image;
      case "notes": return BookOpen;
      default: return PenTool;
    }
  };

  const addThreadPart = () => {
    setThreadParts([...threadParts, ""]);
  };

  const removeThreadPart = (index: number) => {
    if (threadParts.length > 1) {
      setThreadParts(threadParts.filter((_, i) => i !== index));
    }
  };

  const updateThreadPart = (index: number, value: string) => {
    const updated = [...threadParts];
    updated[index] = value;
    setThreadParts(updated);
  };

  const addNoteItem = () => {
    setNoteItems([...noteItems, {heading: "", content: ""}]);
  };

  const removeNoteItem = (index: number) => {
    if (noteItems.length > 1) {
      setNoteItems(noteItems.filter((_, i) => i !== index));
    }
  };

  const updateNoteItem = (index: number, field: 'heading' | 'content', value: string) => {
    const updated = [...noteItems];
    updated[index][field] = value;
    setNoteItems(updated);
  };

  const renderContentForm = () => {
    const Icon = getSubtypeIcon(subtype);
    
    switch (subtype) {
      case "text":
        return (
          <>
            <Input
              placeholder="Title for your thoughtful post..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <Textarea
              placeholder="Share your thoughtful, long-form content. Dive deep into your ideas..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
              maxLength={2000}
            />
          </>
        );

      case "thread":
        return (
          <>
            <Input
              placeholder="Thread title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Thread Parts</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addThreadPart}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Part
                </Button>
              </div>
              {threadParts.map((part, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    placeholder={`Part ${index + 1}: Share this point in your thread...`}
                    value={part}
                    onChange={(e) => updateThreadPart(index, e.target.value)}
                    className="min-h-[80px] flex-1"
                    maxLength={280}
                  />
                  {threadParts.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeThreadPart(index)}
                      className="h-fit self-start mt-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </>
        );

      case "audio":
        return (
          <>
            <Input
              placeholder="Episode title or audio name..."
              value={episodeTitle}
              onChange={(e) => setEpisodeTitle(e.target.value)}
              maxLength={200}
            />
            <Input
              placeholder="Audio file URL or embed link..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <Textarea
              placeholder="Describe your audio content, add timestamps, key insights, or episode notes..."
              value={audioDescription}
              onChange={(e) => setAudioDescription(e.target.value)}
              className="min-h-[120px]"
              maxLength={2000}
            />
          </>
        );

      case "video":
        return (
          <>
            <Input
              placeholder="Video title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <Input
              placeholder="Video URL or embed link..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <Input
              placeholder="Thumbnail image URL (optional)..."
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
            <Textarea
              placeholder="Describe your video content, add chapters, timestamps, or key moments..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              maxLength={2000}
            />
          </>
        );

      case "image":
        return (
          <>
            <Input
              placeholder="Image title or heading..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <Input
              placeholder="Image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Textarea
              placeholder="Share the story behind your image, visual metaphor, or thoughtful reflection..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
            />
          </>
        );

      case "notes":
        return (
          <>
            <Input
              placeholder="Notes collection title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notes & Resources</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNoteItem}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>
              {noteItems.map((item, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Heading (optional)..."
                      value={item.heading}
                      onChange={(e) => updateNoteItem(index, 'heading', e.target.value)}
                      className="flex-1"
                      maxLength={100}
                    />
                    {noteItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeNoteItem(index)}
                        className="h-fit"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    placeholder="Note content, resource, or reference..."
                    value={item.content}
                    onChange={(e) => updateNoteItem(index, 'content', e.target.value)}
                    className="min-h-[80px]"
                    maxLength={500}
                  />
                </div>
              ))}
            </div>
          </>
        );

      default:
        return (
          <>
            <Input
              placeholder={`Title for your ${getSubtypeLabel(subtype)}...`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <Textarea
              placeholder="Share your thoughtful content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              maxLength={2000}
            />
          </>
        );
    }
  };

  const Icon = getSubtypeIcon(subtype);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
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
              {renderContentForm()}
              
              <TagSelector
                selectedTags={tags}
                onTagsChange={setTags}
                placeholder="Add relevant tags..."
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