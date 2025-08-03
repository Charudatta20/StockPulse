import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, BarChart3, Wallet } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PortfolioOverviewProps {
  portfolio?: any;
  holdings?: any[];
}

export default function PortfolioOverview({ portfolio, holdings }: PortfolioOverviewProps) {
  const { currency } = useCurrency();

  // Calculate portfolio metrics
  const totalValue = holdings?.reduce((sum, holding) => {
    return sum + parseFloat(holding.currentValue || "0");
  }, 0) || 0;

  const totalCost = holdings?.reduce((sum, holding) => {
    return sum + parseFloat(holding.totalCost || "0");
  }, 0) || 0;

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  const dayGainLoss = holdings?.reduce((sum, holding) => {
    if (holding.currentPrice && holding.quantity) {
      const currentPrice = parseFloat(holding.currentPrice.price || "0");
      const previousClose = parseFloat(holding.currentPrice.previousClose || "0");
      const dayChange = (currentPrice - previousClose) * holding.quantity;
      return sum + dayChange;
    }
    return sum;
  }, 0) || 0;

  const totalPositions = holdings?.length || 0;
  const buyingPower = 15420.88; // This would come from user data

  const formatCurrency = (amount: number, stockCurrency?: string) => {
    const currencySymbol = stockCurrency === "INR" ? "₹" : "$";
    return `${currencySymbol}${Math.abs(amount).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Portfolio Value Card */}
      <div className="lg:col-span-2">
        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Value</h2>
              <Select defaultValue="1D">
                <SelectTrigger className="w-20 text-sm bg-transparent border-0 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1D</SelectItem>
                  <SelectItem value="1W">1W</SelectItem>
                  <SelectItem value="1M">1M</SelectItem>
                  <SelectItem value="1Y">1Y</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalValue)}
              </span>
              <div className="flex items-center space-x-1">
                {totalGainLoss >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`font-medium ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalGainLoss >= 0 ? "+" : ""}{formatCurrency(totalGainLoss)}
                </span>
                <span className={`text-sm ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ({totalGainLoss >= 0 ? "+" : ""}{totalGainLossPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Simplified Chart Representation */}
            <div className="mt-4 h-32 bg-gradient-to-r from-primary/10 to-green-500/10 rounded-lg flex items-end justify-between px-2 pb-2">
              {[...Array(8)].map((_, i) => {
                const height = Math.random() * 80 + 20;
                const isPositive = Math.random() > 0.3;
                return (
                  <div 
                    key={i}
                    className={`w-2 rounded-t ${isPositive ? "bg-green-500" : "bg-primary"}`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="space-y-4">
        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                {dayGainLoss >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Today's Change</p>
                <p className={`text-lg font-semibold ${dayGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {dayGainLoss >= 0 ? "+" : ""}{formatCurrency(dayGainLoss)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Positions</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{totalPositions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Buying Power</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(buyingPower)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
