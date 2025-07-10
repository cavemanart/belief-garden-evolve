import { BookOpen, MessageSquare, TrendingUp, Users, Brain, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Long-form Essays",
    description: "Share deep thoughts and explorations with rich formatting, images, and thoughtful TL;DR summaries."
  },
  {
    icon: TrendingUp,
    title: "Belief Evolution",
    description: "Track how your perspectives change over time with Before & After cards that celebrate growth."
  },
  {
    icon: MessageSquare,
    title: "Thoughtful Discourse",
    description: "Engage in meaningful conversations with highlight-to-comment and upvote sorting—no noise, just depth."
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get summaries, opposing viewpoints, and source checking to challenge and expand your thinking."
  },
  {
    icon: Users,
    title: "Topic Communities",
    description: "Connect around shared interests without follower counts—let ideas speak louder than influence."
  },
  {
    icon: Shield,
    title: "Distraction-Free",
    description: "No ads, no vanity metrics, no algorithmic manipulation—just pure focus on authentic expression."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-reading">
            Everything you need to think and grow
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Unthink provides the tools and environment for meaningful reflection, 
            authentic expression, and genuine intellectual growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="p-6 hover:shadow-medium transition-all duration-200 group bg-card border-border/50"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground font-interface">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;