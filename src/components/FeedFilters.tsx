import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FeedFiltersProps {
  availableTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onClearFilters: () => void;
}

const FeedFilters = ({ availableTags, selectedTags, onTagSelect, onClearFilters }: FeedFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Filter by topics</h3>
        {selectedTags.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <Badge 
              key={tag} 
              variant="default" 
              className="cursor-pointer flex items-center space-x-1"
              onClick={() => onTagSelect(tag)}
            >
              <span>{tag}</span>
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Available tags */}
      <div className="flex flex-wrap gap-2">
        {availableTags
          .filter(tag => !selectedTags.includes(tag))
          .map(tag => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onTagSelect(tag)}
            >
              {tag}
            </Badge>
          ))}
      </div>
    </div>
  );
};

export default FeedFilters;