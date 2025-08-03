import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/layout/Navigation";
import IPOCard from "@/components/ipo/IPOCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Building2 } from "lucide-react";

export default function IPOs() {
  const [selectedStatus, setSelectedStatus] = useState<string>("UPCOMING");
  const [selectedCountry, setSelectedCountry] = useState<string>("IN");

  const { data: ipos, isLoading } = useQuery({
    queryKey: ["/api/ipos", { status: selectedStatus, country: selectedCountry }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedCountry !== "all") params.append("country", selectedCountry);
      params.append("limit", "20");

      const response = await fetch(`/api/ipos?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
  });

  const statusOptions = [
    { value: "UPCOMING", label: "Upcoming" },
    { value: "OPEN", label: "Open" },
    { value: "CLOSED", label: "Closed" },
    { value: "LISTED", label: "Listed" },
  ];

  const countryOptions = [
    { value: "IN", label: "India" },
    { value: "US", label: "United States" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Initial Public Offerings (IPOs)
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track upcoming and ongoing IPOs to discover new investment opportunities
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {ipos?.filter((ipo: any) => ipo.status === 'UPCOMING').length || 0}
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {ipos?.filter((ipo: any) => ipo.status === 'OPEN').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total IPOs</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {ipos?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {countryOptions.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* IPO Tabs */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="UPCOMING">Upcoming</TabsTrigger>
            <TabsTrigger value="OPEN">Open</TabsTrigger>
            <TabsTrigger value="CLOSED">Closed</TabsTrigger>
            <TabsTrigger value="LISTED">Listed</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <div className="animate-pulse p-6">
                      <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                      </div>
                      <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded mt-4"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : ipos && ipos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ipos.map((ipo: any) => (
                  <IPOCard key={ipo.id} ipo={ipo} />
                ))}
              </div>
            ) : (
              <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <CardContent className="p-12 text-center">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No IPOs Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    No IPOs found for the selected filters
                  </p>
                  <Button 
                    onClick={() => {
                      setSelectedStatus("UPCOMING");
                      setSelectedCountry("IN");
                    }}
                    variant="outline"
                  >
                    View Upcoming IPOs
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
