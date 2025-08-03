import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Building2, TrendingUp } from "lucide-react";

interface IPOCardProps {
  ipo: any;
}

export default function IPOCard({ ipo }: IPOCardProps) {
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      UPCOMING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      OPEN: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      LISTED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    const symbol = currency === "INR" ? "₹" : "$";
    
    if (numAmount >= 1e9) {
      return `${symbol}${(numAmount / 1e9).toFixed(1)}B`;
    } else if (numAmount >= 1e7) {
      return `${symbol}${(numAmount / 1e7).toFixed(0)} Cr`;
    } else if (numAmount >= 1e6) {
      return `${symbol}${(numAmount / 1e6).toFixed(1)}M`;
    }
    return `${symbol}${numAmount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const getActionButton = () => {
    switch (ipo.status) {
      case "UPCOMING":
        return (
          <Button className="w-full bg-primary hover:bg-primary/90">
            <Calendar className="w-4 h-4 mr-2" />
            Set Reminder
          </Button>
        );
      case "OPEN":
        return (
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <TrendingUp className="w-4 h-4 mr-2" />
            Apply Now
          </Button>
        );
      case "CLOSED":
        return (
          <Button variant="outline" className="w-full" disabled>
            <Building2 className="w-4 h-4 mr-2" />
            Closed
          </Button>
        );
      case "LISTED":
        return (
          <Button variant="outline" className="w-full">
            <DollarSign className="w-4 h-4 mr-2" />
            View Stock
          </Button>
        );
      default:
        return (
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        );
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              {ipo.companyName}
            </h4>
            {ipo.symbol && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Symbol: {ipo.symbol}
              </p>
            )}
          </div>
          <Badge className={getStatusColor(ipo.status)}>
            {ipo.status}
          </Badge>
        </div>

        {/* IPO Details */}
        <div className="space-y-2 mb-4">
          {(ipo.priceMin && ipo.priceMax) && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Price Band:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {ipo.currency === "INR" ? "₹" : "$"}{ipo.priceMin} - {ipo.currency === "INR" ? "₹" : "$"}{ipo.priceMax}
              </span>
            </div>
          )}
          
          {ipo.openDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Opens:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(ipo.openDate)}
              </span>
            </div>
          )}
          
          {ipo.closeDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Closes:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(ipo.closeDate)}
              </span>
            </div>
          )}
          
          {ipo.issueSize && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Issue Size:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(ipo.issueSize, ipo.currency)}
              </span>
            </div>
          )}

          {ipo.exchange && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Exchange:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {ipo.exchange}
              </span>
            </div>
          )}

          {ipo.sector && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Sector:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {ipo.sector}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {ipo.description && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {ipo.description}
            </p>
          </div>
        )}

        {/* Action Button */}
        {getActionButton()}
      </CardContent>
    </Card>
  );
}
