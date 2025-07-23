import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TagSelector from "@/components/TagSelector";
import MediaUpload from "@/components/MediaUpload";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreatePodcastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPodcastCreated: () => void;
}

const podcastCategories = [
  "Arts", "Business", "Comedy", "Education", "Fiction", "Government", "Health & Fitness",
  "History", "Kids & Family", "Leisure", "Music", "News", "Religion & Spirituality",
  "Science", "Society & Culture", "Sports", "Technology", "True Crime", "TV & Film"
];

export function CreatePodcastModal({ open, onOpenChange, onPodcastCreated }: CreatePodcastModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("en");
  const [explicit, setExplicit] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setLanguage("en");
    setExplicit(false);
    setTags([]);
    setCoverImageUrl("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCoverImageUpload = (url: string) => {
    setCoverImageUrl(url);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a podcast",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a podcast title",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('podcasts')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category,
          language,
          explicit,
          tags,
          cover_image_url: coverImageUrl,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Podcast created successfully!",
      });

      onPodcastCreated();
      handleClose();
    } catch (error) {
      console.error('Error creating podcast:', error);
      toast({
        title: "Error",
        description: "Failed to create podcast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Podcast</DialogTitle>
          <DialogDescription>
            Create a new podcast series to organize your episodes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cover Image */}
          <div>
            <Label>Cover Image</Label>
            <MediaUpload
              onUpload={handleCoverImageUpload}
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
              bucket="images"
              label="Upload cover image"
              className="mt-2"
            />
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Podcast Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter podcast title"
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your podcast..."
              className="mt-2 h-24"
            />
          </div>

          {/* Category */}
          <div>
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {podcastCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div>
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="ko">Korean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Explicit Content */}
          <div className="flex items-center space-x-2">
            <Switch
              id="explicit"
              checked={explicit}
              onCheckedChange={setExplicit}
            />
            <Label htmlFor="explicit">Contains explicit content</Label>
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
            Create Podcast
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}