import { Calendar, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BeliefCardProps {
  before: string;
  after: string;
  dateChanged: string;
  topic?: string;
  explanation?: string;
}

const BeliefCard = ({ before, after, dateChanged, topic, explanation }: BeliefCardProps) => {
  return (
    <Card className="p-6 hover:shadow-medium transition-all duration-200 bg-gradient-warm border-border/50">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
            {topic || "Belief Evolution"}
          </span>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            {dateChanged}
          </div>
        </div>

        {/* Before */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Before</span>
          </div>
          <p className="text-sm text-foreground/80 italic leading-relaxed">
            "{before}"
          </p>
        </div>

        {/* Arrow indicator */}
        <div className="flex justify-center">
          <TrendingUp className="w-4 h-4 text-success" />
        </div>

        {/* After */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-xs uppercase tracking-wide text-success">Now</span>
          </div>
          <p className="text-sm text-foreground font-medium leading-relaxed">
            "{after}"
          </p>
        </div>

        {/* Optional explanation */}
        {explanation && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {explanation}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BeliefCard;