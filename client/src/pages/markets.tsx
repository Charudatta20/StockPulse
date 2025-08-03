import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/layout/Navigation";
import MarketOverview from "@/components/market/MarketOverview";
import StockScreener from "@/components/stocks/StockScreener";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, TrendingUp, BarChart3 } from "lucide-react";

export default function Markets() {
  const [selectedMarket, setSelectedMarket] = useState<string>("all");

  const { data: marketOverview } = useQuery({
    queryKey: ["/api/market/overview"],
  });

  const { data: stocks = [], isLoading: stocksLoading } = useQuery({
    queryKey: ["/api/stocks"],
    queryFn: async () => {
      const response = await fetch("/api/stocks?limit=100", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
  });

  // Filter stocks based on selected market
  const filteredStocks = stocks?.filter((stock: any) => {
    if (selectedMarket === "all") return true;
    if (selectedMarket === "us") return stock.country === "US";
    if (selectedMarket === "in") return stock.country === "IN";
    return true;
  }) || [];

  // Calculate market statistics
  const totalStocks = filteredStocks.length;
  const gainers = filteredStocks.filter((stock: any) => 
    stock.currentPrice && parseFloat(stock.currentPrice.change || '0') > 0
  ).length;
  const losers = filteredStocks.filter((stock: any) => 
    stock.currentPrice && parseFloat(stock.currentPrice.change || '0') < 0
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Market Overview */}
        <div className="mb-8">
          <MarketOverview />
        </div>

        {/* Market Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Stocks</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {totalStocks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gainers</p>
                  <p className="text-lg font-semibold text-success">
                    {gainers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Losers</p>
                  <p className="text-lg font-semibold text-danger">
                    {losers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unchanged</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {totalStocks - gainers - losers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Tabs */}
        <Tabs defaultValue="screener" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="screener">Stock Screener</TabsTrigger>
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
          </TabsList>

          <TabsContent value="screener" className="mt-6">
            {stocksLoading ? (
              <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading stocks...</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredStocks.length > 0 ? (
              <StockScreener stocks={filteredStocks} />
            ) : (
              <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No stocks found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Try adjusting your market filter</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gainers" className="mt-6">
            <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Top Gainers
                  </CardTitle>
                  <select 
                    className="text-sm bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2 border-0 focus:ring-2 focus:ring-primary"
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                  >
                    <option value="all">All Markets</option>
                    <option value="us">US Markets</option>
                    <option value="in">Indian Markets</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-600">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Symbol</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Company</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Change</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">% Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                      {filteredStocks
                        .filter((stock: any) => 
                          stock.currentPrice && parseFloat(stock.currentPrice.change || '0') > 0
                        )
                        .sort((a: any, b: any) => 
                          parseFloat(b.currentPrice?.changePercent || '0') - parseFloat(a.currentPrice?.changePercent || '0')
                        )
                        .slice(0, 20)
                        .map((stock: any) => (
                          <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                            <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                              {stock.symbol}
                            </td>
                            <td className="py-4 px-4 text-gray-900 dark:text-white">
                              {stock.name}
                            </td>
                            <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                              {stock.currency === 'INR' ? '₹' : '$'}{parseFloat(stock.currentPrice?.price || '0').toFixed(2)}
                            </td>
                            <td className="py-4 px-4 text-success font-semibold">
                              +{stock.currency === 'INR' ? '₹' : '$'}{parseFloat(stock.currentPrice?.change || '0').toFixed(2)}
                            </td>
                            <td className="py-4 px-4 text-success font-semibold">
                              +{parseFloat(stock.currentPrice?.changePercent || '0').toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="losers" className="mt-6">
            <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Top Losers
                  </CardTitle>
                  <select 
                    className="text-sm bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2 border-0 focus:ring-2 focus:ring-primary"
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                  >
                    <option value="all">All Markets</option>
                    <option value="us">US Markets</option>
                    <option value="in">Indian Markets</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-600">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Symbol</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Company</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Change</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">% Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                      {filteredStocks
                        .filter((stock: any) => 
                          stock.currentPrice && parseFloat(stock.currentPrice.change || '0') < 0
                        )
                        .sort((a: any, b: any) => 
                          parseFloat(a.currentPrice?.changePercent || '0') - parseFloat(b.currentPrice?.changePercent || '0')
                        )
                        .slice(0, 20)
                        .map((stock: any) => (
                          <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                            <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                              {stock.symbol}
                            </td>
                            <td className="py-4 px-4 text-gray-900 dark:text-white">
                              {stock.name}
                            </td>
                            <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                              {stock.currency === 'INR' ? '₹' : '$'}{parseFloat(stock.currentPrice?.price || '0').toFixed(2)}
                            </td>
                            <td className="py-4 px-4 text-danger font-semibold">
                              {stock.currency === 'INR' ? '₹' : '$'}{parseFloat(stock.currentPrice?.change || '0').toFixed(2)}
                            </td>
                            <td className="py-4 px-4 text-danger font-semibold">
                              {parseFloat(stock.currentPrice?.changePercent || '0').toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
