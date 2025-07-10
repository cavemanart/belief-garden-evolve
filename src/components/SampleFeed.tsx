import EssayCard from "./EssayCard";
import BeliefCard from "./BeliefCard";
import { Button } from "@/components/ui/button";
import { Filter, TrendingUp } from "lucide-react";

const sampleEssays = [
  {
    title: "Why I Changed My Mind About Remote Work",
    excerpt: "After two years of advocating for office culture, I've discovered that meaningful collaboration isn't about proximity—it's about intention and structure.",
    author: "Sarah Chen",
    readTime: "8 min read",
    tags: ["Work", "Leadership", "Culture"],
    commentCount: 23,
    publishedAt: "3 days ago"
  },
  {
    title: "The Paradox of Productivity Culture",
    excerpt: "In our quest to optimize every moment, we might be losing the very thing that makes life worth living: the space to simply be.",
    author: "Marcus Rivera",
    readTime: "12 min read",
    tags: ["Philosophy", "Lifestyle", "Mental Health"],
    commentCount: 45,
    publishedAt: "1 week ago"
  },
  {
    title: "Rethinking Success in the Age of AI",
    excerpt: "As machines become more capable, our definition of human achievement needs a fundamental update. Here's what I've learned.",
    author: "Dr. Amira Patel",
    readTime: "15 min read",
    tags: ["AI", "Future", "Career"],
    commentCount: 67,
    publishedAt: "2 weeks ago"
  }
];

const sampleBeliefs = [
  {
    before: "Social media is just a tool—it's how you use it that matters.",
    after: "Social media platforms are designed to exploit psychological vulnerabilities, making healthy usage nearly impossible for most people.",
    dateChanged: "March 2024",
    topic: "Technology",
    explanation: "After reading 'The Age of Surveillance Capitalism' and doing a 30-day digital detox."
  },
  {
    before: "Hard work always leads to success if you're patient enough.",
    after: "Systemic barriers and luck play much larger roles in success than individual effort alone.",
    dateChanged: "January 2024",
    topic: "Economics"
  }
];

const SampleFeed = () => {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground font-reading mb-2">
              Recent Thoughts
            </h2>
            <p className="text-muted-foreground">
              Essays and belief evolutions from the community
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main feed */}
          <div className="lg:col-span-2 space-y-6">
            {sampleEssays.map((essay, index) => (
              <EssayCard key={index} {...essay} />
            ))}
          </div>

          {/* Sidebar with belief cards */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground font-interface">
                Recent Belief Evolutions
              </h3>
              {sampleBeliefs.map((belief, index) => (
                <BeliefCard key={index} {...belief} />
              ))}
            </div>

            {/* Topics sidebar */}
            <div className="bg-muted/50 p-6 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold text-foreground font-interface mb-4">
                Trending Topics
              </h3>
              <div className="space-y-2">
                {["Climate Change", "AI Ethics", "Mental Health", "Remote Work", "Parenting"].map((topic, index) => (
                  <button 
                    key={index}
                    className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleFeed;