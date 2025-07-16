import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import FeedPostCard from "@/components/FeedPostCard";
import FeedFilters from "@/components/FeedFilters";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface FeedPost {
  id: string;
  type: 'essay' | 'belief_card' | 'repost';
  content: any;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  created_at: string;
  hearts_count: number;
  comments_count: number;
  reposts_count: number;
  is_hearted: boolean;
  repost_comment?: string;
  original_author?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('following');

  const fetchFeedPosts = async () => {
    setLoading(true);
    try {
      let feedPosts: FeedPost[] = [];

      if (activeTab === 'following' && user) {
        // Get posts from people the user follows
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const followingIds = follows?.map(f => f.following_id) || [];
        
        if (followingIds.length > 0) {
          // Get essays from followed users
          const { data: essays } = await supabase
            .from('essays')
            .select(`
              id, title, excerpt, content, tags, created_at, published, user_id,
              profiles!fk_essays_profiles(id, display_name, avatar_url)
            `)
            .in('user_id', followingIds)
            .eq('published', true)
            .order('created_at', { ascending: false })
            .limit(10);

          // Get belief cards from followed users
          const { data: beliefCards } = await supabase
            .from('belief_cards')
            .select(`
              id, previous_belief, current_belief, explanation, tags, created_at, user_id,
              profiles!fk_belief_cards_profiles(id, display_name, avatar_url)
            `)
            .in('user_id', followingIds)
            .order('created_at', { ascending: false })
            .limit(10);

          // Convert to feed format
          const essayPosts: FeedPost[] = (essays || []).map(essay => ({
            id: essay.id,
            type: 'essay' as const,
            content: essay,
            author: {
              id: (essay.profiles as any)?.id || essay.user_id,
              display_name: (essay.profiles as any)?.display_name || 'Anonymous',
              avatar_url: (essay.profiles as any)?.avatar_url
            },
            created_at: essay.created_at,
            hearts_count: 0,
            comments_count: 0,
            reposts_count: 0,
            is_hearted: false
          }));

          const beliefPosts: FeedPost[] = (beliefCards || []).map(card => ({
            id: card.id,
            type: 'belief_card' as const,
            content: card,
            author: {
              id: (card.profiles as any)?.id || card.user_id,
              display_name: (card.profiles as any)?.display_name || 'Anonymous',
              avatar_url: (card.profiles as any)?.avatar_url
            },
            created_at: card.created_at,
            hearts_count: 0,
            comments_count: 0,
            reposts_count: 0,
            is_hearted: false
          }));

          feedPosts = [...essayPosts, ...beliefPosts];
        }
      } else {
        // Get trending/all posts based on topic filters
        const { data: essays } = await supabase
          .from('essays')
          .select(`
            id, title, excerpt, content, tags, created_at, published, user_id,
            profiles!fk_essays_profiles(id, display_name, avatar_url)
          `)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(20);

        const { data: beliefCards } = await supabase
          .from('belief_cards')
          .select(`
            id, previous_belief, current_belief, explanation, tags, created_at, user_id,
            profiles!fk_belief_cards_profiles(id, display_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        // Convert to feed format
        const essayPosts: FeedPost[] = (essays || []).map(essay => ({
          id: essay.id,
          type: 'essay' as const,
          content: essay,
          author: {
            id: (essay.profiles as any)?.id || essay.user_id,
            display_name: (essay.profiles as any)?.display_name || 'Anonymous',
            avatar_url: (essay.profiles as any)?.avatar_url
          },
          created_at: essay.created_at,
          hearts_count: 0,
          comments_count: 0,
          reposts_count: 0,
          is_hearted: false
        }));

        const beliefPosts: FeedPost[] = (beliefCards || []).map(card => ({
          id: card.id,
          type: 'belief_card' as const,
          content: card,
          author: {
            id: (card.profiles as any)?.id || card.user_id,
            display_name: (card.profiles as any)?.display_name || 'Anonymous',
            avatar_url: (card.profiles as any)?.avatar_url
          },
          created_at: card.created_at,
          hearts_count: 0,
          comments_count: 0,
          reposts_count: 0,
          is_hearted: false
        }));

        feedPosts = [...essayPosts, ...beliefPosts];
      }

      // Filter by selected tags
      if (selectedTags.length > 0) {
        feedPosts = feedPosts.filter(post => 
          post.content.tags?.some((tag: string) => selectedTags.includes(tag))
        );
      }

      // Sort by created_at
      feedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Get engagement counts and user interactions
      await Promise.all(feedPosts.map(async (post) => {
        const heartTable = post.type === 'essay' ? 'essay_id' : 'belief_card_id';
        
        // Get hearts count
        const { count: heartsCount } = await supabase
          .from('hearts')
          .select('*', { count: 'exact', head: true })
          .eq(heartTable, post.id);

        // Get comments count
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq(post.type === 'essay' ? 'essay_id' : 'belief_card_id', post.id);

        // Get reposts count
        const { count: repostsCount } = await supabase
          .from('reposts')
          .select('*', { count: 'exact', head: true })
          .eq(heartTable, post.id);

        // Check if user has hearted
        let isHearted = false;
        if (user) {
          const { data: userHeart } = await supabase
            .from('hearts')
            .select('id')
            .eq('user_id', user.id)
            .eq(heartTable, post.id)
            .single();
          
          isHearted = !!userHeart;
        }

        post.hearts_count = heartsCount || 0;
        post.comments_count = commentsCount || 0;
        post.reposts_count = repostsCount || 0;
        post.is_hearted = isHearted;
      }));

      setPosts(feedPosts);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedPosts();
  }, [activeTab, selectedTags, user]);

  const getTrendingTopics = () => {
    const topicCounts: { [key: string]: number } = {};
    posts.forEach(post => {
      post.content.tags?.forEach((tag: string) => {
        topicCounts[tag] = (topicCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 12)
      .map(([tag]) => tag);
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Discovery Feed</h1>
          <p className="text-muted-foreground">Thoughtful content from your community</p>
        </div>

        {/* Tabs for Following vs Trending */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="following">Fresh From People You Follow</TabsTrigger>
            <TabsTrigger value="tech">Trending in Tech</TabsTrigger>
            <TabsTrigger value="culture">Culture & Spirituality</TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="space-y-6">
            {user ? (
              <>
                <FeedFilters 
                  availableTags={getTrendingTopics()}
                  selectedTags={selectedTags}
                  onTagSelect={handleTagFilter}
                  onClearFilters={clearFilters}
                />
                
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      Follow some interesting people to see their posts here
                    </p>
                    <Button variant="gentle" onClick={() => setActiveTab('tech')}>
                      Explore Trending Content
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map(post => (
                      <FeedPostCard 
                        key={`${post.type}-${post.id}`} 
                        post={post} 
                        onUpdate={fetchFeedPosts}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Sign in to see posts from people you follow
                </p>
                <Button variant="warm" onClick={() => window.location.href = '/auth'}>
                  Sign In
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tech" className="space-y-6">
            <FeedFilters 
              availableTags={['Technology', 'AI', 'Startups', 'Programming', 'Web3', 'Innovation']}
              selectedTags={selectedTags}
              onTagSelect={handleTagFilter}
              onClearFilters={clearFilters}
            />
            
            <div className="space-y-6">
              {posts
                .filter(post => 
                  !selectedTags.length || 
                  post.content.tags?.some((tag: string) => 
                    ['Technology', 'AI', 'Startups', 'Programming', 'Web3', 'Innovation'].includes(tag) ||
                    selectedTags.includes(tag)
                  )
                )
                .map(post => (
                  <FeedPostCard 
                    key={`${post.type}-${post.id}`} 
                    post={post} 
                    onUpdate={fetchFeedPosts}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="culture" className="space-y-6">
            <FeedFilters 
              availableTags={['Philosophy', 'Spirituality', 'Psychology', 'Art', 'Literature', 'Culture']}
              selectedTags={selectedTags}
              onTagSelect={handleTagFilter}
              onClearFilters={clearFilters}
            />
            
            <div className="space-y-6">
              {posts
                .filter(post => 
                  !selectedTags.length || 
                  post.content.tags?.some((tag: string) => 
                    ['Philosophy', 'Spirituality', 'Psychology', 'Art', 'Literature', 'Culture'].includes(tag) ||
                    selectedTags.includes(tag)
                  )
                )
                .map(post => (
                  <FeedPostCard 
                    key={`${post.type}-${post.id}`} 
                    post={post} 
                    onUpdate={fetchFeedPosts}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Feed;