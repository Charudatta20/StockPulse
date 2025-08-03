import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/layout/Navigation";
import NewsCard from "@/components/news/NewsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Newspaper, Globe, TrendingUp } from "lucide-react";

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");

  const { data: news, isLoading } = useQuery({
    queryKey: ["/api/news", { category: selectedCategory, market: selectedMarket }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedMarket !== "all") params.append("market", selectedMarket);
      params.append("limit", "20");

      const response = await fetch(`/api/news?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "TECHNOLOGY", label: "Technology" },
    { value: "FINANCE", label: "Finance" },
    { value: "GLOBAL", label: "Global" },
    { value: "ENERGY", label: "Energy" },
    { value: "HEALTHCARE", label: "Healthcare" },
  ];

  const markets = [
    { value: "all", label: "All Markets" },
    { value: "US", label: "US Markets" },
    { value: "IN", label: "Indian Markets" },
    { value: "GLOBAL", label: "Global" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Market News</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with the latest financial news and market insights
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {markets.map((market) => (
                <option key={market.value} value={market.value}>
                  {market.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* News Content */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : news && news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article: any) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <CardContent className="p-12 text-center">
                <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No News Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  No news articles found for the selected filters
                </p>
                <Button 
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedMarket("all");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
