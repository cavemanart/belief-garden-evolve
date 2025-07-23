import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TagSelector from "@/components/TagSelector";
import MediaUpload from "@/components/MediaUpload";
import { TextToSpeechGenerator } from "@/components/TextToSpeechGenerator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Link, Mic } from "lucide-react";

interface Podcast {
  id: string;
  title: string;
}

interface CreateEpisodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEpisodeCreated: () => void;
  selectedPodcastId?: string | null;
  podcasts: Podcast[];
  onClose: () => void;
}

export function CreateEpisodeModal({ 
  open, 
  onOpenChange, 
  onEpisodeCreated, 
  selectedPodcastId, 
  podcasts,
  onClose 
}: CreateEpisodeModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [podcastId, setPodcastId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [seasonNumber, setSeasonNumber] = useState("1");
  const [published, setPublished] = useState(false);
  const [publishDate, setPublishDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [externalAudioUrl, setExternalAudioUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [audioMethod, setAudioMethod] = useState<"upload" | "url" | "generate">("upload");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPodcastId) {
      setPodcastId(selectedPodcastId);
    }
  }, [selectedPodcastId]);

  useEffect(() => {
    // Auto-set publish date to today if published is true
    if (published && !publishDate) {
      setPublishDate(new Date().toISOString().split('T')[0]);
    }
  }, [published, publishDate]);

  const resetForm = () => {
    setPodcastId(selectedPodcastId || "");
    setTitle("");
    setDescription("");
    setContent("");
    setEpisodeNumber("");
    setSeasonNumber("1");
    setPublished(false);
    setPublishDate("");
    setTags([]);
    setAudioUrl("");
    setExternalAudioUrl("");
    setDuration("");
    setAudioMethod("upload");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAudioUpload = (url: string) => {
    setAudioUrl(url);
    setExternalAudioUrl(""); // Clear external URL if uploading
  };

  const handleAudioGenerated = (url: string, estimatedDuration?: number) => {
    setAudioUrl(url);
    setExternalAudioUrl(""); // Clear external URL if generating
    if (estimatedDuration) {
      const minutes = Math.floor(estimatedDuration / 60);
      const seconds = estimatedDuration % 60;
      setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  };

  const parseDuration = (durationStr: string): number => {
    if (!durationStr) return 0;
    
    // Try to parse HH:MM:SS or MM:SS format
    const parts = durationStr.split(':').map(part => parseInt(part, 10));
    
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      // Just seconds
      return parts[0];
    }
    
    return 0;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an episode",
        variant: "destructive",
      });
      return;
    }

    if (!podcastId) {
      toast({
        title: "Error",
        description: "Please select a podcast",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an episode title",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const episodeData = {
        podcast_id: podcastId,
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        episode_number: episodeNumber ? parseInt(episodeNumber) : null,
        season_number: parseInt(seasonNumber),
        published,
        publish_date: published && publishDate ? new Date(publishDate).toISOString() : null,
        tags,
        audio_url: (audioMethod === "upload" || audioMethod === "generate") ? audioUrl : "",
        external_audio_url: audioMethod === "url" ? externalAudioUrl : "",
        duration: duration ? parseDuration(duration) : null,
      };

      const { error } = await supabase
        .from('episodes')
        .insert(episodeData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Episode ${published ? 'published' : 'saved as draft'} successfully!`,
      });

      onEpisodeCreated();
      handleClose();
    } catch (error) {
      console.error('Error creating episode:', error);
      toast({
        title: "Error",
        description: "Failed to create episode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Episode</DialogTitle>
          <DialogDescription>
            Add a new episode to your podcast series
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Podcast Selection */}
          <div>
            <Label>Podcast *</Label>
            <Select value={podcastId} onValueChange={setPodcastId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a podcast" />
              </SelectTrigger>
              <SelectContent>
                {podcasts.map((podcast) => (
                  <SelectItem key={podcast.id} value={podcast.id}>
                    {podcast.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Episode Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter episode title"
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="episodeNumber">Episode #</Label>
                <Input
                  id="episodeNumber"
                  type="number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  placeholder="1"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="seasonNumber">Season</Label>
                <Input
                  id="seasonNumber"
                  type="number"
                  value={seasonNumber}
                  onChange={(e) => setSeasonNumber(e.target.value)}
                  placeholder="1"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the episode..."
              className="mt-2 h-20"
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Show Notes / Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed show notes, transcript, or episode content..."
              className="mt-2 h-32"
            />
          </div>

          {/* Audio Upload/URL */}
          <div>
            <Label>Audio Content</Label>
            <Tabs value={audioMethod} onValueChange={(value) => setAudioMethod(value as "upload" | "url" | "generate")} className="mt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Generate
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="mt-4">
                <MediaUpload
                  onUpload={handleAudioUpload}
                  accept="audio/*"
                  maxSize={100 * 1024 * 1024} // 100MB
                  bucket="audio"
                  label="Upload audio file"
                />
              </TabsContent>
              
              <TabsContent value="url" className="mt-4">
                <Input
                  value={externalAudioUrl}
                  onChange={(e) => {
                    setExternalAudioUrl(e.target.value);
                    setAudioUrl(""); // Clear uploaded audio if using URL
                  }}
                  placeholder="https://example.com/audio.mp3"
                />
              </TabsContent>
              
              <TabsContent value="generate" className="mt-4">
                <TextToSpeechGenerator
                  onAudioGenerated={handleAudioGenerated}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration">Duration (optional)</Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="MM:SS or HH:MM:SS"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: MM:SS or HH:MM:SS (e.g., 45:30 or 1:23:45)
            </p>
          </div>

          {/* Publishing */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published">Publish now</Label>
            </div>
            
            {published && (
              <div>
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <TagSelector
              selectedTags={tags}
              onTagsChange={setTags}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {published ? "Publish Episode" : "Save Draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}