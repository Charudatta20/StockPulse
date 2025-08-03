import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/layout/Navigation";
import StockCard from "@/components/stocks/StockCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Eye } from "lucide-react";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Watchlist() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: watchlists = [] } = useQuery({
    queryKey: ["/api/watchlists"],
    enabled: !!user,
  });

  const { data: watchlistItems = [] } = useQuery({
    queryKey: ["/api/watchlists", watchlists?.[0]?.id, "items"],
    enabled: !!watchlists?.[0]?.id,
  });

  const { data: searchResults } = useQuery({
    queryKey: ["/api/stocks", { search: searchQuery }],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/stocks?search=${encodeURIComponent(searchQuery)}&limit=10`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    enabled: searchQuery.length > 0,
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (symbol: string) => {
      const watchlistId = watchlists?.[0]?.id;
      if (!watchlistId) throw new Error("No watchlist found");
      
      await apiRequest("POST", `/api/watchlists/${watchlistId}/items`, { symbol });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlists"] });
      toast({
        title: "Success",
        description: "Stock added to watchlist",
      });
      setSearchQuery("");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to add stock to watchlist",
        variant: "destructive",
      });
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (stockId: string) => {
      const watchlistId = watchlists?.[0]?.id;
      if (!watchlistId) throw new Error("No watchlist found");
      
      await apiRequest("DELETE", `/api/watchlists/${watchlistId}/items/${stockId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlists"] });
      toast({
        title: "Success",
        description: "Stock removed from watchlist",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to remove stock from watchlist",
        variant: "destructive",
      });
    },
  });

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

  const handleAddStock = (symbol: string) => {
    addToWatchlistMutation.mutate(symbol);
  };

  const handleRemoveStock = (stockId: string) => {
    removeFromWatchlistMutation.mutate(stockId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Watchlist</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track stocks you're interested in
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Stock to Watchlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search stocks (e.g., AAPL, TSLA)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchResults && searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {searchResults.map((stock: any) => (
                      <div
                        key={stock.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {stock.symbol.slice(0, 3)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {stock.symbol}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {stock.name}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddStock(stock.symbol)}
                          disabled={addToWatchlistMutation.isPending}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Watchlist Content */}
        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Tracked Stocks ({watchlistItems?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {watchlistItems && watchlistItems.length > 0 ? (
              <div className="space-y-4">
                {watchlistItems.map((item: any) => (
                  <StockCard
                    key={item.stockId}
                    stock={item.stock}
                    currentPrice={item.currentPrice}
                    showRemove
                    onRemove={() => handleRemoveStock(item.stockId)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Stocks in Watchlist
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Add stocks you want to track and monitor their performance
                </p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Stock
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
