import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Download, Mic, Volume2 } from "lucide-react";

interface TextToSpeechGeneratorProps {
  onAudioGenerated: (url: string, duration?: number) => void;
  className?: string;
}

const voices = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced' },
  { id: 'echo', name: 'Echo', description: 'Calm, thoughtful' },
  { id: 'fable', name: 'Fable', description: 'Warm, storytelling' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative' },
  { id: 'nova', name: 'Nova', description: 'Energetic, bright' },
  { id: 'shimmer', name: 'Shimmer', description: 'Gentle, soothing' },
];

export function TextToSpeechGenerator({ onAudioGenerated, className = "" }: TextToSpeechGeneratorProps) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [loading, setLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generateAudio = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert to speech",
        variant: "destructive",
      });
      return;
    }

    if (text.length > 4000) {
      toast({
        title: "Error",
        description: "Text is too long. Please limit to 4000 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call the text-to-speech edge function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: text.trim(),
          voice: selectedVoice,
        },
      });

      if (error) throw error;

      if (!data?.audioContent) {
        throw new Error("No audio content received");
      }

      // Convert base64 to blob
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mp3' });

      // Create object URL for preview
      const previewUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(previewUrl);

      // Upload to Supabase storage
      const fileName = `generated-audio-${Date.now()}.mp3`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(`${fileName}`, audioBlob, {
          contentType: 'audio/mp3',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(uploadData.path);

      setGeneratedAudio(publicUrl);

      // Estimate duration (rough approximation: 150 words per minute, average 5 chars per word)
      const wordCount = text.trim().split(/\s+/).length;
      const estimatedDuration = Math.ceil((wordCount / 150) * 60); // in seconds

      toast({
        title: "Success",
        description: "Audio generated successfully!",
      });

      onAudioGenerated(publicUrl, estimatedDuration);
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Error",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `generated-audio-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Text-to-Speech Generator
        </CardTitle>
        <CardDescription>
          Convert your text to high-quality speech using AI voice synthesis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Selection */}
        <div>
          <Label>Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{voice.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {voice.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Text to Convert</Label>
            <div className="text-xs text-muted-foreground">
              {wordCount} words • {charCount}/4000 characters
            </div>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you want to convert to speech..."
            className="min-h-[120px]"
            maxLength={4000}
          />
          {charCount > 3500 && (
            <p className="text-xs text-amber-600 mt-1">
              Approaching character limit
            </p>
          )}
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateAudio} 
          disabled={loading || !text.trim() || charCount > 4000}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Audio...
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              Generate Audio
            </>
          )}
        </Button>

        {/* Generated Audio Preview */}
        {audioUrl && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Generated Audio</h4>
              <Badge variant="secondary">Ready</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={playAudio}>
                <Play className="h-3 w-3 mr-1" />
                Play
              </Button>
              <Button variant="outline" size="sm" onClick={downloadAudio}>
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
            {generatedAudio && (
              <p className="text-xs text-muted-foreground mt-2">
                Audio uploaded and ready to use in your episode
              </p>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use punctuation to control pacing and pauses</li>
            <li>Try different voices to find the best fit for your content</li>
            <li>Break up long content into shorter segments for better results</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}