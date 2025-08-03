import { Button } from "@/components/ui/button";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface StockCardProps {
  stock: any;
  currentPrice?: any;
  quantity?: number;
  totalValue?: string;
  change?: string;
  changePercent?: string;
  averageCost?: string;
  showQuantity?: boolean;
  showDetails?: boolean;
  showRemove?: boolean;
  compact?: boolean;
  onRemove?: () => void;
}

export default function StockCard({
  stock,
  currentPrice,
  quantity,
  totalValue,
  change,
  changePercent,
  averageCost,
  showQuantity = false,
  showDetails = false,
  showRemove = false,
  compact = false,
  onRemove,
}: StockCardProps) {
  const { currency } = useCurrency();

  const formatCurrency = (amount: string | number, stockCurrency?: string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    const currencySymbol = stockCurrency === "INR" ? "₹" : "$";
    return `${currencySymbol}${Math.abs(numAmount).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const currentPriceValue = currentPrice?.price ? parseFloat(currentPrice.price) : 0;
  const priceChange = currentPrice?.change ? parseFloat(currentPrice.change) : (change ? parseFloat(change) : 0);
  const priceChangePercent = currentPrice?.changePercent ? parseFloat(currentPrice.changePercent) : (changePercent ? parseFloat(changePercent) : 0);

  const isPositive = priceChange >= 0;

  // Generate initials for stock logo
  const getStockInitials = (symbol: string) => {
    return symbol.slice(0, Math.min(4, symbol.length));
  };

  // Get stock logo color based on symbol
  const getStockColor = (symbol: string) => {
    const colors = [
      "bg-blue-600", "bg-green-600", "bg-purple-600", "bg-red-600", 
      "bg-yellow-600", "bg-indigo-600", "bg-pink-600", "bg-gray-600"
    ];
    const index = symbol.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${getStockColor(stock.symbol)} rounded-lg flex items-center justify-center`}>
            <span className="text-white font-semibold text-xs">
              {getStockInitials(stock.symbol)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stock.exchange || stock.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(currentPriceValue, stock.currency)}
          </p>
          <p className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? "+" : ""}{formatCurrency(priceChange, stock.currency)} ({isPositive ? "+" : ""}{priceChangePercent.toFixed(2)}%)
          </p>
        </div>
        {showRemove && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-gray-400 hover:text-red-500 ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 hover:shadow-sm">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 ${getStockColor(stock.symbol)} rounded-lg flex items-center justify-center`}>
          <span className="text-white font-semibold text-sm">
            {getStockInitials(stock.symbol)}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {stock.name}
            {showQuantity && quantity && (
              <span className="ml-2">• {quantity} shares</span>
            )}
            {stock.exchange && (
              <span className="ml-2">• {stock.exchange}</span>
            )}
          </p>
          {showDetails && averageCost && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Avg Cost: {formatCurrency(averageCost, stock.currency)}
            </p>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-semibold text-gray-900 dark:text-white">
          {totalValue ? formatCurrency(totalValue, stock.currency) : formatCurrency(currentPriceValue, stock.currency)}
        </p>
        {(priceChange !== 0 || changePercent) && (
          <div className="flex items-center justify-end space-x-1">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <p className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? "+" : ""}{formatCurrency(priceChange, stock.currency)} ({isPositive ? "+" : ""}{priceChangePercent.toFixed(2)}%)
            </p>
          </div>
        )}
        {showDetails && currentPriceValue > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Current: {formatCurrency(currentPriceValue, stock.currency)}
          </p>
        )}
      </div>

      {showRemove && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 ml-4"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
