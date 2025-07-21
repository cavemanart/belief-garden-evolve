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
import MediaUpload from "./MediaUpload";

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
  
  // Media upload states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [uploadedAudio, setUploadedAudio] = useState<string[]>([]);
  
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
    setUploadedImages([]);
    setUploadedVideos([]);
    setUploadedAudio([]);
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

  const handleMediaUpload = (url: string, type: string) => {
    if (type.startsWith('image/')) {
      setUploadedImages(prev => [...prev, url]);
    } else if (type.startsWith('video/')) {
      setUploadedVideos(prev => [...prev, url]);
    } else if (type.startsWith('audio/')) {
      setUploadedAudio(prev => [...prev, url]);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate based on subtype
    let actualContent = content;
    let hasValidContent = false;

    switch (subtype) {
      case "thread":
        hasValidContent = Boolean(title.trim() && threadParts.some(part => part.trim()));
        actualContent = threadParts.filter(part => part.trim()).join('\n\n');
        break;
      case "audio":
        hasValidContent = Boolean(episodeTitle.trim() && audioDescription.trim());
        actualContent = audioDescription;
        break;
      case "image":
        hasValidContent = Boolean(title.trim() && caption.trim());
        actualContent = caption;
        break;
      case "notes":
        hasValidContent = Boolean(title.trim() && noteItems.some(item => item.content.trim()));
        actualContent = noteItems.filter(item => item.content.trim()).map(item => 
          item.heading ? `${item.heading}\n${item.content}` : item.content
        ).join('\n\n');
        break;
      default:
        hasValidContent = Boolean(title.trim() && content.trim());
        break;
    }

    if (!hasValidContent) {
      toast({
        title: "Missing content",
        description: "Please add both a title and content for your Spark",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare media URLs based on subtype
      let finalImageUrls: string[] = [];
      
      if (subtype === "image") {
        finalImageUrls = uploadedImages;
      } else if (subtype === "video" && uploadedVideos.length > 0) {
        // For video posts, we might want to store video URLs in image_urls or create a separate field
        finalImageUrls = uploadedVideos;
      } else if (subtype === "audio" && uploadedAudio.length > 0) {
        finalImageUrls = uploadedAudio;
      } else {
        // For other types, include any uploaded images
        finalImageUrls = uploadedImages;
      }

      // Use the correct title based on subtype
      const finalTitle = subtype === "audio" ? episodeTitle.trim() : title.trim();

      const { error } = await supabase
        .from("essays")
        .insert({
          title: finalTitle,
          content: actualContent.trim(),
          excerpt: actualContent.substring(0, 200) + (actualContent.length > 200 ? "..." : ""),
          tags,
          published: true,
          user_id: user.id,
          post_type: subtype,
          image_urls: finalImageUrls.length > 0 ? finalImageUrls : null
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
            <MediaUpload
              onUpload={handleMediaUpload}
              accept="image/*"
              maxSize={10 * 1024 * 1024} // 10MB
              bucket="images"
              label="Image"
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
            <MediaUpload
              onUpload={handleMediaUpload}
              accept="video/*"
              maxSize={100 * 1024 * 1024} // 100MB
              bucket="videos"
              label="Video"
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
            <MediaUpload
              onUpload={handleMediaUpload}
              accept="image/*"
              maxSize={10 * 1024 * 1024} // 10MB
              bucket="images"
              label="Image"
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
            <MediaUpload
              onUpload={handleMediaUpload}
              accept="image/*"
              maxSize={10 * 1024 * 1024} // 10MB
              bucket="images"
              label="Image"
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
