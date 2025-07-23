import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

const PREDEFINED_TAGS = [
  'Tech Ethics', 'Creativity', 'Healing', 'Philosophy', 'Science', 
  'Art', 'Psychology', 'Spirituality', 'Politics', 'Environment',
  'Education', 'Health', 'Business', 'Relationships', 'Travel',
  'Food', 'Music', 'Books', 'Film', 'Gaming', 'Fitness',
  'Parenting', 'Career', 'Finance', 'AI', 'Web3', 'Design'
];

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

const TagSelector = ({ 
  selectedTags, 
  onTagsChange, 
  placeholder = "Add topics you write about",
  maxTags = 10,
  className = ""
}: TagSelectorProps) => {
  const [customTag, setCustomTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = PREDEFINED_TAGS.filter(tag => 
    !selectedTags.includes(tag) && 
    tag.toLowerCase().includes(customTag.toLowerCase())
  );

  const addTag = (tag: string) => {
    if (selectedTags.length >= maxTags) return;
    if (!selectedTags.includes(tag) && tag.trim()) {
      onTagsChange([...selectedTags, tag.trim()]);
      setCustomTag('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (customTag.trim()) {
        addTag(customTag);
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-sm">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2 p-0 h-auto hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add new tag */}
      {selectedTags.length < maxTags && (
        <div className="relative">
          <div className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={customTag}
              onChange={(e) => {
                setCustomTag(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addTag(customTag)}
              disabled={!customTag.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && (customTag || filteredSuggestions.length > 0) && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredSuggestions.slice(0, 8).map((tag) => (
                <Button
                  key={tag}
                  variant="ghost"
                  className="w-full justify-start text-left p-2 h-auto"
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </Button>
              ))}
              {customTag && !PREDEFINED_TAGS.includes(customTag) && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left p-2 h-auto border-t"
                  onClick={() => addTag(customTag)}
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Add "{customTag}"
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Popular suggestions */}
      {selectedTags.length === 0 && !showSuggestions && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Popular topics:</p>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_TAGS.slice(0, 6).map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                onClick={() => addTag(tag)}
                className="h-auto py-1 px-2 text-xs"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedTags.length >= maxTags && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxTags} topics selected
        </p>
      )}
    </div>
  );
};

export default TagSelector;