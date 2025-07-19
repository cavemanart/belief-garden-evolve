
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import FeedPostCard from "@/components/FeedPostCard";
import FeedFilters from "@/components/FeedFilters";
import FeedHero from "@/components/FeedHero";
import FloatingCreateButton from "@/components/FloatingCreateButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface FeedPost {
  id: string;
  type: 'essay' | 'hot_take' | 'repost';
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
              id, title, excerpt, content, tags, created_at, published, user_id
            `)
            .in('user_id', followingIds)
            .eq('published', true)
            .order('created_at', { ascending: false })
            .limit(10);

          // Get hot takes from followed users
          const { data: hotTakes } = await supabase
            .from('hot_takes')
            .select(`
              id, statement, tags, created_at, user_id
            `)
            .in('user_id', followingIds)
            .order('created_at', { ascending: false })
            .limit(10);

          // Get author profiles separately
          const authorIds = [...new Set([...(essays || []).map(e => e.user_id), ...(hotTakes || []).map(c => c.user_id)])];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url')
            .in('user_id', authorIds);

          const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

          // Convert to feed format
          const essayPosts: FeedPost[] = (essays || []).map(essay => ({
            id: essay.id,
            type: 'essay' as const,
            content: essay,
            author: {
              id: essay.user_id,
              display_name: profileMap.get(essay.user_id)?.display_name || 'Anonymous',
              avatar_url: profileMap.get(essay.user_id)?.avatar_url
            },
            created_at: essay.created_at,
            hearts_count: 0,
            comments_count: 0,
            reposts_count: 0,
            is_hearted: false
          }));

          const hotTakePosts: FeedPost[] = (hotTakes || []).map(hotTake => ({
            id: hotTake.id,
            type: 'hot_take' as const,
            content: hotTake,
            author: {
              id: hotTake.user_id,
              display_name: profileMap.get(hotTake.user_id)?.display_name || 'Anonymous',
              avatar_url: profileMap.get(hotTake.user_id)?.avatar_url
            },
            created_at: hotTake.created_at,
            hearts_count: 0,
            comments_count: 0,
            reposts_count: 0,
            is_hearted: false
          }));

          feedPosts = [...essayPosts, ...hotTakePosts];
        }
      } else {
        // Get trending/all posts based on topic filters
        const { data: essays } = await supabase
          .from('essays')
          .select(`
            id, title, excerpt, content, tags, created_at, published, user_id
          `)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(20);

        const { data: hotTakes } = await supabase
          .from('hot_takes')
          .select(`
            id, statement, tags, created_at, user_id
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        // Get author profiles separately
        const authorIds = [...new Set([...(essays || []).map(e => e.user_id), ...(hotTakes || []).map(c => c.user_id)])];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', authorIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        // Convert to feed format
        const essayPosts: FeedPost[] = (essays || []).map(essay => ({
          id: essay.id,
          type: 'essay' as const,
          content: essay,
          author: {
            id: essay.user_id,
            display_name: profileMap.get(essay.user_id)?.display_name || 'Anonymous',
            avatar_url: profileMap.get(essay.user_id)?.avatar_url
          },
          created_at: essay.created_at,
          hearts_count: 0,
          comments_count: 0,
          reposts_count: 0,
          is_hearted: false
        }));

        const hotTakePosts: FeedPost[] = (hotTakes || []).map(hotTake => ({
          id: hotTake.id,
          type: 'hot_take' as const,
          content: hotTake,
          author: {
            id: hotTake.user_id,
            display_name: profileMap.get(hotTake.user_id)?.display_name || 'Anonymous',
            avatar_url: profileMap.get(hotTake.user_id)?.avatar_url
          },
          created_at: hotTake.created_at,
          hearts_count: 0,
          comments_count: 0,
          reposts_count: 0,
          is_hearted: false
        }));

        feedPosts = [...essayPosts, ...hotTakePosts];
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
        const heartColumn = post.type === 'essay' ? 'essay_id' : 'hot_take_id';
        const commentColumn = post.type === 'essay' ? 'essay_id' : 'hot_take_id';
        const repostColumn = post.type === 'essay' ? 'essay_id' : 'hot_take_id';
        
        // Get hearts count
        const { count: heartsCount } = await supabase
          .from('hearts')
          .select('*', { count: 'exact', head: true })
          .eq(heartColumn, post.id);

        // Get comments count
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq(commentColumn, post.id);

        // Get reposts count
        const { count: repostsCount } = await supabase
          .from('reposts')
          .select('*', { count: 'exact', head: true })
          .eq(repostColumn, post.id);

        // Check if user has hearted
        let isHearted = false;
        if (user) {
          const { data: userHeart } = await supabase
            .from('hearts')
            .select('id')
            .eq('user_id', user.id)
            .eq(heartColumn, post.id)
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
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Substack-style centered layout */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <FeedHero />

        {/* Header */}
        <div className="mb-8 mt-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-3">Latest Posts</h1>
          <p className="text-muted-foreground text-lg">Discover thoughtful content and provocative takes</p>
        </div>

        {/* Tabs for Following vs Trending - Centered */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-secondary border border-border">
            <TabsTrigger value="following" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Following
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Discover
            </TabsTrigger>
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
                    <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30">
                      <Loader2 className="w-8 h-8 text-accent" />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Follow some interesting people to see their posts here
                    </p>
                    <Button variant="outline" onClick={() => setActiveTab('trending')} className="border-accent/30 hover:border-accent/60 hover:bg-accent/10">
                      Explore Trending Content
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
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
                <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30">
                  <Loader2 className="w-8 h-8 text-accent" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Sign in to see posts from people you follow
                </p>
                <Button onClick={() => window.location.href = '/auth'} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Sign In
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <FeedFilters 
              availableTags={getTrendingTopics()}
              selectedTags={selectedTags}
              onTagSelect={handleTagFilter}
              onClearFilters={clearFilters}
            />
            
            <div className="space-y-8">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30">
                    <Loader2 className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-muted-foreground">
                    No posts available. Be the first to share something!
                  </p>
                </div>
              ) : (
                posts.map(post => (
                  <FeedPostCard 
                    key={`${post.type}-${post.id}`} 
                    post={post} 
                    onUpdate={fetchFeedPosts}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Create Button */}
      {user && <FloatingCreateButton onContentCreated={fetchFeedPosts} />}
    </div>
  );
};

export default Feed;
