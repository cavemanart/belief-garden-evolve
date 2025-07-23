import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreatePodcastModal } from "@/components/CreatePodcastModal";
import { CreateEpisodeModal } from "@/components/CreateEpisodeModal";
import { Mic2, Plus, Play, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Podcast {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  category: string;
  language: string;
  explicit: boolean;
  tags: string[];
  created_at: string;
  user_id: string;
  episode_count?: number;
}

interface Episode {
  id: string;
  podcast_id: string;
  title: string;
  description: string;
  content: string;
  audio_url: string;
  external_audio_url: string;
  duration: number;
  episode_number: number;
  season_number: number;
  published: boolean;
  publish_date: string;
  tags: string[];
  created_at: string;
  podcast?: {
    title: string;
  };
}

export default function Podcasts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [recentEpisodes, setRecentEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [createPodcastOpen, setCreatePodcastOpen] = useState(false);
  const [createEpisodeOpen, setCreateEpisodeOpen] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPodcasts();
      fetchRecentEpisodes();
    }
  }, [user]);

  const fetchPodcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select(`
          *,
          episodes!episodes_podcast_id_fkey(count)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const podcastsWithCount = data?.map(podcast => ({
        ...podcast,
        episode_count: podcast.episodes?.length || 0
      })) || [];

      setPodcasts(podcastsWithCount);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      toast({
        title: "Error",
        description: "Failed to load podcasts",
        variant: "destructive",
      });
    }
  };

  const fetchRecentEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select(`
          *,
          podcast:podcasts(title)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentEpisodes(data || []);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePodcastCreated = () => {
    fetchPodcasts();
    setCreatePodcastOpen(false);
  };

  const handleEpisodeCreated = () => {
    fetchRecentEpisodes();
    fetchPodcasts();
    setCreateEpisodeOpen(false);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mic2 className="h-8 w-8 text-primary" />
            My Podcasts
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your podcasts and episodes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreatePodcastOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Podcast
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCreateEpisodeOpen(true)}
            disabled={podcasts.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Episode
          </Button>
        </div>
      </div>

      {/* Podcasts Grid */}
      {podcasts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {podcasts.map((podcast) => (
            <Card key={podcast.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                {podcast.cover_image_url && (
                  <div className="w-full h-48 rounded-lg bg-muted mb-4 overflow-hidden">
                    <img
                      src={podcast.cover_image_url}
                      alt={podcast.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <CardTitle className="line-clamp-2">{podcast.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {podcast.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary">{podcast.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {podcast.episode_count || 0} episodes
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {podcast.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedPodcast(podcast.id);
                    setCreateEpisodeOpen(true);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Episode
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 mb-8">
          <CardContent>
            <Mic2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No podcasts yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first podcast to get started
            </p>
            <Button onClick={() => setCreatePodcastOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Podcast
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Episodes */}
      {recentEpisodes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Episodes</h2>
          <div className="space-y-4">
            {recentEpisodes.map((episode) => (
              <Card key={episode.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{episode.title}</h3>
                      {!episode.published && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {episode.podcast?.title} • Episode {episode.episode_number}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {episode.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {episode.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(episode.duration)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(episode.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {(episode.audio_url || episode.external_audio_url) && (
                    <Button variant="outline" size="icon">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreatePodcastModal
        open={createPodcastOpen}
        onOpenChange={setCreatePodcastOpen}
        onPodcastCreated={handlePodcastCreated}
      />
      <CreateEpisodeModal
        open={createEpisodeOpen}
        onOpenChange={setCreateEpisodeOpen}
        onEpisodeCreated={handleEpisodeCreated}
        selectedPodcastId={selectedPodcast}
        podcasts={podcasts}
        onClose={() => {
          setCreateEpisodeOpen(false);
          setSelectedPodcast(null);
        }}
      />
    </div>
  );
}