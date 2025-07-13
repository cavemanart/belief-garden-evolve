import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Users, ExternalLink, Coffee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { Loader } from 'lucide-react';

interface CreatorData {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  belief_areas: string[];
}

interface Essay {
  id: string;
  title: string;
  excerpt: string;
  created_at: string;
  paid_only: boolean;
  tags: string[];
}

const CreatorProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchCreatorData();
    }
  }, [userId]);

  const fetchCreatorData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      const { data: essaysData, error: essaysError } = await supabase
        .from('essays')
        .select('*')
        .eq('user_id', userId)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (essaysError) throw essaysError;

      setCreator(profileData);
      setEssays(essaysData || []);
    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!creator) {
    return <Navigate to="/explore" replace />;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const freePosts = essays.filter(essay => !essay.paid_only);
  const paidPosts = essays.filter(essay => essay.paid_only);
  const highlights = essays.slice(0, 3); // Top 3 posts as highlights

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 pt-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-shrink-0">
            <Avatar className="w-32 h-32 ring-4 ring-primary/10">
              <AvatarImage src={creator.avatar_url} alt={creator.display_name} />
              <AvatarFallback className="text-2xl bg-gradient-elegant text-primary-foreground">
                {getInitials(creator.display_name)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {creator.display_name}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    1.2k followers
                  </span>
                  <span>47 posts</span>
                </div>
              </div>
              
              {!isOwnProfile && (
                <div className="flex gap-2">
                  <Button
                    variant={following ? "outline" : "default"}
                    onClick={() => setFollowing(!following)}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${following ? 'fill-current' : ''}`} />
                    {following ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Coffee className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {creator.bio}
            </p>
            
            {creator.belief_areas && creator.belief_areas.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {creator.belief_areas.map((area, index) => (
                  <Badge key={index} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Social Links */}
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ExternalLink className="w-4 h-4 mr-1" />
                Website
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ExternalLink className="w-4 h-4 mr-1" />
                Podcast
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription CTA */}
        {!isOwnProfile && (
          <Card className="mb-8 bg-gradient-subtle border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Support {creator.display_name}'s Work</h3>
              <p className="text-muted-foreground mb-4">
                Get exclusive content and support independent thinking
              </p>
              <div className="flex gap-2 justify-center">
                <Button>Subscribe ($5/month)</Button>
                <Button variant="outline">Free Newsletter</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="free" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="free">Free Posts ({freePosts.length})</TabsTrigger>
            <TabsTrigger value="paid">Paid Posts ({paidPosts.length})</TabsTrigger>
            <TabsTrigger value="highlights">Highlights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="free" className="mt-6">
            <div className="grid gap-6">
              {freePosts.map((essay) => (
                <Card key={essay.id} className="hover:shadow-medium transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{essay.title}</h3>
                    <p className="text-muted-foreground mb-3">{essay.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {essay.tags?.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(essay.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="paid" className="mt-6">
            <div className="grid gap-6">
              {paidPosts.map((essay) => (
                <Card key={essay.id} className="hover:shadow-medium transition-shadow cursor-pointer border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold">{essay.title}</h3>
                      <Badge className="bg-primary/10 text-primary">Premium</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{essay.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {essay.tags?.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(essay.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="highlights" className="mt-6">
            <div className="grid gap-6">
              {highlights.map((essay) => (
                <Card key={essay.id} className="hover:shadow-medium transition-shadow cursor-pointer bg-gradient-subtle">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold">{essay.title}</h3>
                      <Badge variant="secondary">Featured</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{essay.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {essay.tags?.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(essay.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorProfile;