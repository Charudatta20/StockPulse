import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { isUnauthorizedError } from "@/lib/authUtils";

interface TradeFormData {
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  orderType: "MARKET" | "LIMIT" | "STOP";
  price?: number;
}

export default function QuickTrade() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: "",
    type: "BUY",
    quantity: 0,
    orderType: "MARKET",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults } = useQuery({
    queryKey: ["/api/stocks", { search: searchQuery }],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/stocks?search=${encodeURIComponent(searchQuery)}&limit=5`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    enabled: searchQuery.length > 0,
  });

  const { data: selectedStock } = useQuery({
    queryKey: ["/api/stocks", formData.symbol],
    queryFn: async () => {
      if (!formData.symbol) return null;
      const response = await fetch(`/api/stocks/${formData.symbol}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    enabled: !!formData.symbol,
  });

  const tradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      return await apiRequest("POST", "/api/orders", tradeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Trade Executed",
        description: `${formData.type} order for ${formData.quantity} shares of ${formData.symbol} has been placed successfully.`,
      });
      // Reset form
      setFormData({
        symbol: "",
        type: "BUY",
        quantity: 0,
        orderType: "MARKET",
      });
      setSearchQuery("");
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
        title: "Trade Failed",
        description: "Unable to execute trade. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStockSelect = (stock: any) => {
    setFormData(prev => ({ ...prev, symbol: stock.symbol }));
    setSearchQuery(stock.symbol);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.quantity) {
      toast({
        title: "Invalid Input",
        description: "Please select a stock and enter quantity.",
        variant: "destructive",
      });
      return;
    }

    const currentPrice = selectedStock?.currentPrice?.price;
    if (!currentPrice && formData.orderType === "MARKET") {
      toast({
        title: "Price Unavailable",
        description: "Unable to get current price for market order.",
        variant: "destructive",
      });
      return;
    }

    const tradeData = {
      symbol: formData.symbol,
      type: formData.type,
      quantity: formData.quantity,
      orderType: formData.orderType,
      price: formData.orderType === "MARKET" ? currentPrice : formData.price,
    };

    tradeMutation.mutate(tradeData);
  };

  const estimatedTotal = selectedStock?.currentPrice?.price 
    ? (parseFloat(selectedStock.currentPrice.price) * formData.quantity).toFixed(2)
    : "0.00";

  const currencySymbol = selectedStock?.currency === "INR" ? "₹" : "$";

  return (
    <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
      <CardHeader className="border-b border-gray-200 dark:border-slate-700">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Trade
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stock Search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Stock
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Enter symbol (e.g., AAPL, TSLA)"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults && searchResults.length > 0 && searchQuery && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                  {searchResults.map((stock: any) => (
                    <div
                      key={stock.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                      onClick={() => handleStockSelect(stock)}
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</p>
                      </div>
                      {stock.currentPrice && (
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {stock.currency === "INR" ? "₹" : "$"}{parseFloat(stock.currentPrice.price).toFixed(2)}
                          </p>
                          <p className={`text-xs ${
                            parseFloat(stock.currentPrice.change || "0") >= 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {parseFloat(stock.currentPrice.changePercent || "0").toFixed(2)}%
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Stock Info */}
          {selectedStock && (
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedStock.symbol}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedStock.name}</p>
                </div>
                {selectedStock.currentPrice && (
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {currencySymbol}{parseFloat(selectedStock.currentPrice.price).toFixed(2)}
                    </p>
                    <p className={`text-sm ${
                      parseFloat(selectedStock.currentPrice.change || "0") >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {parseFloat(selectedStock.currentPrice.change || "0") >= 0 ? "+" : ""}{parseFloat(selectedStock.currentPrice.change || "0").toFixed(2)} ({parseFloat(selectedStock.currentPrice.changePercent || "0").toFixed(2)}%)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trade Type */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={formData.type === "BUY" ? "default" : "outline"}
              className={`py-3 ${formData.type === "BUY" ? "bg-green-600 hover:bg-green-700" : ""}`}
              onClick={() => setFormData(prev => ({ ...prev, type: "BUY" }))}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy
            </Button>
            <Button
              type="button"
              variant={formData.type === "SELL" ? "default" : "outline"}
              className={`py-3 ${formData.type === "SELL" ? "bg-red-600 hover:bg-red-700" : ""}`}
              onClick={() => setFormData(prev => ({ ...prev, type: "SELL" }))}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Sell
            </Button>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantity
            </Label>
            <Input
              type="number"
              placeholder="0"
              min="1"
              value={formData.quantity || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
            />
          </div>

          {/* Order Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Order Type
            </Label>
            <Select 
              value={formData.orderType} 
              onValueChange={(value: "MARKET" | "LIMIT" | "STOP") => 
                setFormData(prev => ({ ...prev, orderType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MARKET">Market Order</SelectItem>
                <SelectItem value="LIMIT">Limit Order</SelectItem>
                <SelectItem value="STOP">Stop Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Limit/Stop Price */}
          {(formData.orderType === "LIMIT" || formData.orderType === "STOP") && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formData.orderType === "LIMIT" ? "Limit Price" : "Stop Price"}
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.price || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          )}

          {/* Estimated Total */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Estimated Total
            </Label>
            <div className="py-3 px-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {currencySymbol}{estimatedTotal}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-3"
            disabled={!formData.symbol || !formData.quantity || tradeMutation.isPending}
          >
            {tradeMutation.isPending ? "Placing Order..." : "Place Order"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
