import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock } from "lucide-react";

interface NewsCardProps {
  article: any;
}

export default function NewsCard({ article }: NewsCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      TECHNOLOGY: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      FINANCE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      GLOBAL: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      ENERGY: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      HEALTHCARE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const getMarketColor = (market: string) => {
    const colors: { [key: string]: string } = {
      US: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      IN: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      GLOBAL: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
    return colors[market] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Less than an hour ago";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
  };

  // Use placeholder image if imageUrl is not available
  const imageUrl = article.imageUrl || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";

  return (
    <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      {/* Article Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to a generic financial image if the article image fails to load
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
          }}
        />
        {/* Category Badge */}
        {article.category && (
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
          </div>
        )}
        {/* Market Badge */}
        {article.market && (
          <div className="absolute top-3 right-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getMarketColor(article.market)}`}>
              {article.market === "IN" ? "Indian Markets" : article.market === "US" ? "US Markets" : article.market}
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Article Title */}
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h4>

        {/* Article Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {article.description || "No description available for this article."}
        </p>

        {/* Article Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>
              {article.publishedAt ? formatDate(article.publishedAt) : "Recently"}
            </span>
            {article.source && (
              <>
                <span>•</span>
                <span>{article.source}</span>
              </>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (article.url) {
                window.open(article.url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            Read More
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
