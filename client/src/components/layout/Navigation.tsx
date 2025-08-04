import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Moon, Sun, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", current: location === "/" },
    { name: "Portfolio", href: "/portfolio", current: location === "/portfolio" },
    { name: "Markets", href: "/markets", current: location === "/markets" },
    { name: "Watchlist", href: "/watchlist", current: location === "/watchlist" },
    { name: "News", href: "/news", current: location === "/news" },
    { name: "IPOs", href: "/ipos", current: location === "/ipos" },
  ];

  const currencies = [
    { value: "USD", label: "USD", symbol: "$" },
    { value: "INR", label: "INR", symbol: "₹" },
    { value: "EUR", label: "EUR", symbol: "€" },
    { value: "GBP", label: "GBP", symbol: "£" },
    { value: "JPY", label: "JPY", symbol: "¥" },
  ];

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">StockPulse</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={`font-medium transition-colors ${
                    item.current
                      ? "text-primary"
                      : "text-gray-600 dark:text-gray-300 hover:text-primary"
                  }`}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Currency Selector */}
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-20 bg-gray-100 dark:bg-slate-700 border-0 focus:ring-2 focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback className="bg-primary text-white text-sm font-medium">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.email || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Premium Member</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-slate-700 py-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
