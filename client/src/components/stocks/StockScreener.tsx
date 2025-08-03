import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShoppingCart } from "lucide-react";

interface StockScreenerProps {
  stocks: any[];
}

export default function StockScreener({ stocks }: StockScreenerProps) {
  const [filters, setFilters] = useState({
    marketCap: "all",
    sector: "all",
    peRatio: "any",
    dividendYield: "any",
    market: "all",
    performance: "any",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Apply filters to stocks
  const filteredStocks = stocks.filter((stock) => {
    if (filters.market && filters.market !== "all" && filters.market !== stock.country) return false;
    if (filters.sector && filters.sector !== "all" && filters.sector !== stock.sector) return false;
    // Add more filter logic as needed
    return true;
  });

  // Apply performance sorting
  let sortedStocks = [...filteredStocks];
  if (filters.performance === "gainers") {
    sortedStocks.sort((a, b) => {
      const aChange = parseFloat(a.currentPrice?.changePercent || "0");
      const bChange = parseFloat(b.currentPrice?.changePercent || "0");
      return bChange - aChange;
    });
  } else if (filters.performance === "losers") {
    sortedStocks.sort((a, b) => {
      const aChange = parseFloat(a.currentPrice?.changePercent || "0");
      const bChange = parseFloat(b.currentPrice?.changePercent || "0");
      return aChange - bChange;
    });
  } else if (filters.performance === "volume") {
    sortedStocks.sort((a, b) => {
      const aVolume = a.currentPrice?.volume || 0;
      const bVolume = b.currentPrice?.volume || 0;
      return bVolume - aVolume;
    });
  }

  // Pagination
  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStocks = sortedStocks.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatMarketCap = (marketCap: string, currency: string) => {
    const value = parseFloat(marketCap);
    const symbol = currency === "INR" ? "₹" : "$";
    
    if (value >= 1e12) {
      return `${symbol}${(value / 1e12).toFixed(1)}T`;
    } else if (value >= 1e9) {
      return `${symbol}${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `${symbol}${(value / 1e6).toFixed(1)}M`;
    }
    return `${symbol}${value.toFixed(0)}`;
  };

  const getStockInitials = (symbol: string) => {
    return symbol.slice(0, Math.min(4, symbol.length));
  };

  const getStockColor = (symbol: string) => {
    const colors = [
      "bg-blue-600", "bg-green-600", "bg-purple-600", "bg-red-600", 
      "bg-yellow-600", "bg-indigo-600", "bg-pink-600", "bg-gray-600"
    ];
    const index = symbol.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Stock Screener
          </CardTitle>
          <Button variant="outline" size="sm">
            Advanced Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Market Cap
            </label>
            <Select value={filters.marketCap} onValueChange={(value) => setFilters({...filters, marketCap: value})}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="large">Large Cap</SelectItem>
                <SelectItem value="mid">Mid Cap</SelectItem>
                <SelectItem value="small">Small Cap</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sector
            </label>
            <Select value={filters.sector} onValueChange={(value) => setFilters({...filters, sector: value})}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Financial</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              P/E Ratio
            </label>
            <Select value={filters.peRatio} onValueChange={(value) => setFilters({...filters, peRatio: value})}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="low">&lt; 15</SelectItem>
                <SelectItem value="medium">15-25</SelectItem>
                <SelectItem value="high">&gt; 25</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Dividend Yield
            </label>
            <Select value={filters.dividendYield} onValueChange={(value) => setFilters({...filters, dividendYield: value})}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="low">&lt; 2%</SelectItem>
                <SelectItem value="medium">2%-5%</SelectItem>
                <SelectItem value="high">&gt; 5%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Market
            </label>
            <Select value={filters.market} onValueChange={(value) => setFilters({...filters, market: value})}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Markets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                <SelectItem value="US">US (NASDAQ/NYSE)</SelectItem>
                <SelectItem value="IN">India (NSE/BSE)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Performance
            </label>
            <Select value={filters.performance} onValueChange={(value) => setFilters({...filters, performance: value})}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="gainers">Top Gainers</SelectItem>
                <SelectItem value="losers">Top Losers</SelectItem>
                <SelectItem value="volume">High Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-600">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Symbol</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Change</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Market Cap</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">P/E</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
              {paginatedStocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${getStockColor(stock.symbol)} rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-semibold text-xs">
                          {getStockInitials(stock.symbol)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{stock.symbol}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{stock.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stock.sector}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                    {stock.currentPrice ? formatCurrency(parseFloat(stock.currentPrice.price), stock.currency) : "N/A"}
                  </td>
                  <td className="py-4 px-4">
                    {stock.currentPrice && stock.currentPrice.change ? (
                      <span className={parseFloat(stock.currentPrice.change) >= 0 ? "text-green-600" : "text-red-600"}>
                        {parseFloat(stock.currentPrice.change) >= 0 ? "+" : ""}{formatCurrency(parseFloat(stock.currentPrice.change), stock.currency)} ({parseFloat(stock.currentPrice.changePercent || "0").toFixed(2)}%)
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-900 dark:text-white">
                    {stock.marketCap ? formatMarketCap(stock.marketCap, stock.currency) : "N/A"}
                  </td>
                  <td className="py-4 px-4 text-gray-900 dark:text-white">
                    {stock.peRatio ? parseFloat(stock.peRatio).toFixed(1) : "N/A"}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedStocks.length)} of {sortedStocks.length} stocks
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
