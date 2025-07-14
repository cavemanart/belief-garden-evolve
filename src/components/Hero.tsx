import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Heart } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground font-reading leading-tight">
                Write, reflect, and
                <span className="text-primary"> evolve</span> your beliefs
              </h1>
              <p className="text-xl text-muted-foreground font-interface leading-relaxed">
                A thoughtful publishing platform where ideas grow, beliefs transform,
                and authentic conversations flourish—free from clout and noise.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="warm"
                size="lg"
                className="group"
                onClick={() => navigate("/write")}
              >
                Start Writing
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="gentle"
                size="lg"
                onClick={() => navigate("/explore")}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Explore Ideas
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">No follower counts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-muted-foreground">Track belief evolution</span>
              </div>
              <div className="flex items-center space-x-3">
                <Heart className="w-4 h-4 text-success" />
                <span className="text-sm text-muted-foreground">Thoughtful discourse</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-large">
              <img
                src={heroImage}
                alt="Unthink - Platform for evolving beliefs"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-card border border-border rounded-lg p-3 shadow-medium animate-gentle-bounce">
              <span className="text-xs text-muted-foreground">Belief evolved</span>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-success/10 border border-success/20 rounded-lg p-3 shadow-medium">
              <span className="text-xs text-success">Growth mindset</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
