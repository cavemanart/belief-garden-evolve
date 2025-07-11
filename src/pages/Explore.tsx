import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Clock, Bookmark, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import EssayCard from '@/components/EssayCard';
import BeliefCard from '@/components/BeliefCard';

interface Essay {
  id: string;
  title: string;
  content: string;
  tldr: string | null;
  tags: string[];
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  } | null;
}

interface BeliefCardData {
  id: string;
  previous_belief: string;
  current_belief: string;
  explanation: string | null;
  date_changed: string | null;
  tags: string[];
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  } | null;
}

const Explore = () => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [beliefCards, setBeliefCards] = useState<BeliefCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      // Fetch essays (simplified)
      const { data: essaysData, error: essaysError } = await supabase
        .from('essays')
        .select('id, title, content, tldr, tags, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (essaysError) throw essaysError;

      // Fetch belief cards (simplified)
      const { data: beliefsData, error: beliefsError } = await supabase
        .from('belief_cards')
        .select('id, previous_belief, current_belief, explanation, date_changed, tags, created_at')
        .order('created_at', { ascending: false });

      if (beliefsError) throw beliefsError;

      // Add null profiles for compatibility
      const essaysWithProfiles = essaysData?.map(essay => ({ ...essay, profiles: null })) || [];
      const beliefsWithProfiles = beliefsData?.map(belief => ({ ...belief, profiles: null })) || [];

      setEssays(essaysWithProfiles);
      setBeliefCards(beliefsWithProfiles);

      // Extract all unique tags
      const essayTags = essaysData?.flatMap(essay => essay.tags) || [];
      const beliefTags = beliefsData?.flatMap(belief => belief.tags) || [];
      const uniqueTags = [...new Set([...essayTags, ...beliefTags])];
      setAllTags(uniqueTags);

    } catch (error: any) {
      toast({
        title: "Failed to load content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEssays = essays.filter(essay => {
    const matchesSearch = searchQuery === '' || 
      essay.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      essay.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === null || essay.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const filteredBeliefCards = beliefCards.filter(belief => {
    const matchesSearch = searchQuery === '' || 
      belief.previous_belief.toLowerCase().includes(searchQuery.toLowerCase()) ||
      belief.current_belief.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === null || belief.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto p-6 pt-24">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground font-interface">
              Explore Ideas
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how others are thinking, growing, and evolving their beliefs
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search essays, beliefs, topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Popular Topics</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedTag === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(null)}
                    >
                      All Topics
                    </Button>
                    {allTags.slice(0, 10).map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTag === tag ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                All Content
              </TabsTrigger>
              <TabsTrigger value="essays" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Essays
              </TabsTrigger>
              <TabsTrigger value="beliefs" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Belief Cards
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Recent Essays</h3>
                 {filteredEssays.slice(0, 3).map((essay) => (
                   <EssayCard
                     key={essay.id}
                     title={essay.title}
                     excerpt={essay.content.substring(0, 150) + '...'}
                     author={essay.profiles?.display_name || 'Anonymous'}
                     readTime="5 min read"
                     tags={essay.tags}
                     commentCount={0}
                     publishedAt={new Date(essay.created_at).toLocaleDateString()}
                   />
                 ))}
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Recent Belief Changes</h3>
                   {filteredBeliefCards.slice(0, 3).map((belief) => (
                     <BeliefCard
                       key={belief.id}
                       before={belief.previous_belief}
                       after={belief.current_belief}
                       explanation={belief.explanation || undefined}
                       dateChanged={belief.date_changed || 'Unknown'}
                       topic={belief.tags[0] || undefined}
                     />
                   ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="essays" className="space-y-6">
              <div className="grid gap-6">
                 {filteredEssays.map((essay) => (
                   <EssayCard
                     key={essay.id}
                     title={essay.title}
                     excerpt={essay.content.substring(0, 300) + '...'}
                     author={essay.profiles?.display_name || 'Anonymous'}
                     readTime="5 min read"
                     tags={essay.tags}
                     commentCount={0}
                     publishedAt={new Date(essay.created_at).toLocaleDateString()}
                   />
                 ))}
                {filteredEssays.length === 0 && !loading && (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No essays found matching your criteria.</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="beliefs" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                 {filteredBeliefCards.map((belief) => (
                   <BeliefCard
                     key={belief.id}
                     before={belief.previous_belief}
                     after={belief.current_belief}
                     explanation={belief.explanation || undefined}
                     dateChanged={belief.date_changed || 'Unknown'}
                     topic={belief.tags[0] || undefined}
                   />
                 ))}
                {filteredBeliefCards.length === 0 && !loading && (
                  <Card className="p-8 text-center col-span-2">
                    <p className="text-muted-foreground">No belief cards found matching your criteria.</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Explore;