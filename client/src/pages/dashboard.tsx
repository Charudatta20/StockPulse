import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import Navigation from "@/components/layout/Navigation";
import PortfolioOverview from "@/components/portfolio/PortfolioOverview";
import QuickTrade from "@/components/trading/QuickTrade";
import MarketOverview from "@/components/market/MarketOverview";
import StockCard from "@/components/stocks/StockCard";
import NewsCard from "@/components/news/NewsCard";
import IPOCard from "@/components/ipo/IPOCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: portfolios = [] } = useQuery({
    queryKey: ["/api/portfolios"],
    enabled: !!user,
  });

  const { data: holdings = [] } = useQuery({
    queryKey: ["/api/portfolios", portfolios?.[0]?.id, "holdings"],
    enabled: !!portfolios?.[0]?.id,
  });

  const { data: watchlists = [] } = useQuery({
    queryKey: ["/api/watchlists"],
    enabled: !!user,
  });

  const { data: watchlistItems = [] } = useQuery({
    queryKey: ["/api/watchlists", watchlists?.[0]?.id, "items"],
    enabled: !!watchlists?.[0]?.id,
  });

  const { data: news } = useQuery({
    queryKey: ["/api/news"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/news?limit=6", {
          credentials: "include",
        });
        if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
        return response.json();
      } catch (error) {
        if (isUnauthorizedError(error as Error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
          return null;
        }
        throw error;
      }
    },
  });

  const { data: upcomingIPOs } = useQuery({
    queryKey: ["/api/ipos"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/ipos?status=UPCOMING&country=IN&limit=3", {
          credentials: "include",
        });
        if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
        return response.json();
      } catch (error) {
        if (isUnauthorizedError(error as Error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
          return null;
        }
        throw error;
      }
    },
  });

  // WebSocket connection for real-time updates
  const { subscribe } = useWebSocket();

  useEffect(() => {
    if (holdings && holdings.length > 0) {
      const symbols = holdings.map((h: any) => h.stock.symbol);
      subscribe(symbols);
    }
  }, [holdings, subscribe]);

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const defaultPortfolio = portfolios?.[0];
  const defaultWatchlist = watchlists?.[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Portfolio Overview */}
        <div className="mb-8">
          <PortfolioOverview portfolio={defaultPortfolio} holdings={holdings} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Holdings & Watchlist */}
          <div className="xl:col-span-2 space-y-6">
            {/* Holdings Section */}
            <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <CardHeader className="border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your Holdings
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {holdings && holdings.length > 0 ? (
                  <div className="space-y-4">
                    {holdings.slice(0, 4).map((holding: any) => (
                      <StockCard
                        key={holding.id}
                        stock={holding.stock}
                        currentPrice={holding.currentPrice}
                        quantity={holding.quantity}
                        totalValue={holding.currentValue}
                        change={holding.gainLoss}
                        changePercent={holding.gainLossPercent}
                        showQuantity
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No holdings yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Start trading to build your portfolio</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Watchlist Section */}
            <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <CardHeader className="border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Watchlist
                  </CardTitle>
                  <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {watchlistItems && watchlistItems.length > 0 ? (
                  <div className="space-y-3">
                    {watchlistItems.slice(0, 5).map((item: any) => (
                      <StockCard
                        key={item.stockId}
                        stock={item.stock}
                        currentPrice={item.currentPrice}
                        compact
                        showRemove
                        onRemove={() => {
                          // Handle remove from watchlist
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No stocks in watchlist</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Add stocks to track their performance</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Trading Interface & Market Data */}
          <div className="space-y-6">
            {/* Quick Trade */}
            <QuickTrade />

            {/* Market Overview */}
            <MarketOverview />

            {/* Upcoming IPOs */}
            <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <CardHeader className="border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Upcoming IPOs
                  </CardTitle>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full">
                    India Focus
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {upcomingIPOs && upcomingIPOs.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingIPOs.map((ipo: any) => (
                      <IPOCard key={ipo.id} ipo={ipo} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No upcoming IPOs</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Market News */}
        <div className="mt-8">
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <CardHeader className="border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Market News
                </CardTitle>
                <select className="text-sm bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2 border-0 focus:ring-2 focus:ring-primary">
                  <option>All Markets</option>
                  <option>US Markets</option>
                  <option>Indian Markets</option>
                  <option>Global</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {news && news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.map((article: any) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No news available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
