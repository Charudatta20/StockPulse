import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MarketOverview() {
  const { data: marketOverview, isLoading } = useQuery({
    queryKey: ["/api/market/overview"],
    queryFn: async () => {
      const response = await fetch("/api/market/overview", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
  });

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === "INR" ? "₹" : "";
    return `${symbol}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
      <CardHeader className="border-b border-gray-200 dark:border-slate-700">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-12"></div>
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : marketOverview && marketOverview.length > 0 ? (
          <div className="space-y-4">
            {marketOverview.map((index: any) => {
              const currentPrice = index.currentPrice?.price ? parseFloat(index.currentPrice.price) : 0;
              const change = index.currentPrice?.change ? parseFloat(index.currentPrice.change) : 0;
              const changePercent = index.currentPrice?.changePercent ? parseFloat(index.currentPrice.changePercent) : 0;
              const isPositive = change >= 0;

              return (
                <div key={index.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{index.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{index.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(currentPrice, index.currency)}
                    </p>
                    <div className="flex items-center justify-end space-x-1">
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <p className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? "+" : ""}{formatCurrency(change, index.currency)} ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Market data unavailable</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
