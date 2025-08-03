import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/layout/Navigation";
import PortfolioOverview from "@/components/portfolio/PortfolioOverview";
import StockCard from "@/components/stocks/StockCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, History } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Portfolio() {
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

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
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

  const defaultPortfolio = portfolios?.[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Portfolio Overview */}
        <div className="mb-8">
          <PortfolioOverview portfolio={defaultPortfolio} holdings={holdings} />
        </div>

        {/* Portfolio Tabs */}
        <Tabs defaultValue="holdings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="holdings" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Holdings</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Order History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="holdings" className="mt-6">
            <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Current Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {holdings && holdings.length > 0 ? (
                  <div className="space-y-4">
                    {holdings.map((holding: any) => (
                      <StockCard
                        key={holding.id}
                        stock={holding.stock}
                        currentPrice={holding.currentPrice}
                        quantity={holding.quantity}
                        totalValue={holding.currentValue}
                        change={holding.gainLoss}
                        changePercent={holding.gainLossPercent}
                        averageCost={holding.averageCost}
                        showQuantity
                        showDetails
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Holdings Yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Start building your portfolio by making your first trade
                    </p>
                    <Button className="bg-primary hover:bg-primary/90">
                      Start Trading
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Portfolio Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Return</span>
                      <span className="font-semibold text-success">
                        {defaultPortfolio?.totalGainLoss || "$0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Day's Change</span>
                      <span className="font-semibold text-success">
                        {defaultPortfolio?.dayGainLoss || "$0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Invested</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {defaultPortfolio?.totalCost || "$0.00"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Asset Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Chart visualization coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-600">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Stock
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Type
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Quantity
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Price
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                        {orders.map((order: any) => (
                          <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                  <span className="text-white font-semibold text-xs">
                                    {order.stock.symbol.slice(0, 4)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {order.stock.symbol}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {order.stock.name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                order.type === 'BUY' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {order.type}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-900 dark:text-white">
                              {order.quantity}
                            </td>
                            <td className="py-4 px-4 text-gray-900 dark:text-white">
                              ${parseFloat(order.filledPrice || order.price || '0').toFixed(2)}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                order.status === 'FILLED' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : order.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-900 dark:text-white text-sm">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Orders Yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Your trading history will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
