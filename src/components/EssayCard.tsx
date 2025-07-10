import { Clock, MessageCircle, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EssayCardProps {
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  tags: string[];
  commentCount: number;
  publishedAt: string;
}

const EssayCard = ({ title, excerpt, author, readTime, tags, commentCount, publishedAt }: EssayCardProps) => {
  return (
    <Card className="group hover:shadow-medium transition-all duration-200 cursor-pointer bg-card border-border/50">
      <div className="p-6 space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center text-xs text-accent-foreground bg-accent/20 px-2 py-1 rounded-full"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground font-reading leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-muted-foreground leading-relaxed line-clamp-3">
          {excerpt}
        </p>

        {/* Author and metadata */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {author.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{author}</p>
              <p className="text-xs text-muted-foreground">{publishedAt}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{readTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EssayCard;