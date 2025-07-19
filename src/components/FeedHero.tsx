
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MessageCircle, Heart, Tag, TrendingUp } from "lucide-react";

const FeedHero = () => {
  const featuredPost = {
    title: "The Future of Thoughtful Discourse in Digital Spaces",
    excerpt: "How platforms like Unthink are reshaping the way we engage with complex ideas and challenge our beliefs in meaningful ways.",
    author: "Sarah Chen",
    readTime: "8 min read",
    tags: ["Philosophy", "Technology", "Society"],
    hearts: 142,
    comments: 23,
    image: "/placeholder.svg"
  };

  const trendingTopics = [
    "AI Ethics", "Climate Change", "Future of Work", "Mental Health", "Democracy"
  ];

  return (
    <div className="space-y-8">
      {/* Hero Featured Post */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-secondary border-accent/20 hover:border-accent/40 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
        <div className="relative p-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Featured</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {featuredPost.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center text-xs text-accent-foreground bg-accent/20 px-3 py-1 rounded-full border border-accent/30"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {featuredPost.title}
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {featuredPost.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30">
                      <span className="text-sm font-medium text-accent">
                        {featuredPost.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{featuredPost.author}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {featuredPost.readTime}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Heart className="w-4 h-4 text-accent" />
                    <span>{featuredPost.hearts}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    <span>{featuredPost.comments}</span>
                  </div>
                </div>
              </div>
              
              <Button size="lg" className="w-full md:w-auto">
                Read Full Article
              </Button>
            </div>
            
            <div className="hidden md:block">
              <div className="aspect-video bg-muted/20 rounded-lg border border-accent/20 flex items-center justify-center">
                <div className="text-muted-foreground text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Tag className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-sm">Featured Article</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Trending Topics Bar */}
      <div className="flex items-center gap-4 py-4 border-b border-border/50">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Trending:
        </span>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {trendingTopics.map((topic, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="whitespace-nowrap text-accent hover:text-accent-foreground hover:bg-accent/20 border border-transparent hover:border-accent/30"
            >
              #{topic}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedHero;
