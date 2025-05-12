import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Response Rate data (mock for visualization)
const responseRateData = [
  { month: "Jan", rate: 28 },
  { month: "Feb", rate: 32 },
  { month: "Mar", rate: 36 },
  { month: "Apr", rate: 30 },
  { month: "May", rate: 34 },
  { month: "Jun", rate: 38 },
];

// Campaign Performance data (mock for visualization)
const campaignPerformanceData = [
  { name: "Q4 Client Outreach", sent: 56, opened: 42, responded: 18 },
  { name: "Thank You Notes", sent: 32, opened: 28, responded: 22 },
  { name: "Enterprise Demo", sent: 24, opened: 16, responded: 9 },
  { name: "Product Launch", sent: 48, opened: 32, responded: 14 },
];

// Letter Status data (mock for visualization)
const letterStatusData = [
  { name: "Delivered", value: 63, color: "#4f46e5" },
  { name: "Opened", value: 45, color: "#16a34a" },
  { name: "Responded", value: 22, color: "#ca8a04" },
  { name: "Pending", value: 12, color: "#9ca3af" },
];

// Timeframe options
const timeframeOptions = [
  { value: "7days", label: "Last 7 days" },
  { value: "30days", label: "Last 30 days" },
  { value: "90days", label: "Last 90 days" },
  { value: "6months", label: "Last 6 months" },
  { value: "year", label: "Last year" },
];

function Analytics() {
  const [timeframe, setTimeframe] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch analytics data
  const { data, isLoading } = useQuery({
    queryKey: ["/api/analytics", timeframe],
    enabled: false, // Disabled because endpoint not implemented yet
  });

  return (
    <PageContainer title="Analytics">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Campaign Analytics</h1>
        <div className="mt-4 sm:mt-0 w-full sm:w-48">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Letters Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+23% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32%</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2 days</div>
                <p className="text-xs text-muted-foreground">-0.5 days from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={responseRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis unit="%" />
                      <Tooltip />
                      <Line type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Letter Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={letterStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {letterStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="sent" fill="#4f46e5" name="Sent" />
                    <Bar dataKey="opened" fill="#16a34a" name="Opened" />
                    <Bar dataKey="responded" fill="#ca8a04" name="Responded" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recipients">
          <Card>
            <CardHeader>
              <CardTitle>Top Responding Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">GrowthLabs</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">4/4 responses</p>
                    <p className="text-sm text-gray-500">100% response rate</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Michael Chen</p>
                    <p className="text-sm text-gray-500">TechGrowth</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">3/3 responses</p>
                    <p className="text-sm text-gray-500">100% response rate</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Alex Morgan</p>
                    <p className="text-sm text-gray-500">InnovateX</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">5/6 responses</p>
                    <p className="text-sm text-gray-500">83% response rate</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Emily Rodriguez</p>
                    <p className="text-sm text-gray-500">Vertex Solutions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">3/4 responses</p>
                    <p className="text-sm text-gray-500">75% response rate</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">James Wilson</p>
                    <p className="text-sm text-gray-500">Horizon Enterprises</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">2/3 responses</p>
                    <p className="text-sm text-gray-500">67% response rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

export default Analytics;
