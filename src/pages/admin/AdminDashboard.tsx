import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Building2, AlertCircle, CheckCircle, XCircle, Eye } from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    { label: "Pending Verifications", value: "12", icon: AlertCircle },
    { label: "Active Businesses", value: "234", icon: Building2 },
    { label: "Total Deals", value: "1,456", icon: CheckCircle },
    { label: "Reported Issues", value: "3", icon: XCircle },
  ];

  const pendingBusinesses = [
    { id: 1, name: "Joe's Coffee Shop", email: "joe@coffee.com", submitted: "2 hours ago", status: "pending" },
    { id: 2, name: "Fashion Boutique", email: "info@fashion.com", submitted: "1 day ago", status: "pending" },
    { id: 3, name: "Tech Repair Co", email: "support@tech.com", submitted: "3 days ago", status: "pending" },
  ];

  const reportedDeals = [
    { id: 1, deal: "Fake 90% Discount", business: "Shady Store", reason: "Misleading", reported: "1 day ago" },
    { id: 2, deal: "Expired Coupon", business: "Old Shop", reason: "Expired", reported: "2 days ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Platform Management</p>
              </div>
            </div>
            <Button variant="outline">Settings</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {}
        <Tabs defaultValue="verify" className="space-y-4">
          <TabsList>
            <TabsTrigger value="verify">Verify Businesses</TabsTrigger>
            <TabsTrigger value="reports">Reported Content</TabsTrigger>
            <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="verify" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Business Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingBusinesses.map((business) => (
                      <TableRow key={business.id}>
                        <TableCell className="font-medium">{business.name}</TableCell>
                        <TableCell>{business.email}</TableCell>
                        <TableCell>{business.submitted}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{business.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button size="sm" variant="default">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reported Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportedDeals.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.deal}</TableCell>
                        <TableCell>{report.business}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{report.reason}</Badge>
                        </TableCell>
                        <TableCell>{report.reported}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">Review</Button>
                            <Button size="sm" variant="destructive">Remove Deal</Button>
                            <Button size="sm" variant="secondary">Dismiss</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-foreground">12,456</p>
                    <p className="text-xs text-primary">+234 this week</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Active Deals</p>
                    <p className="text-2xl font-bold text-foreground">1,456</p>
                    <p className="text-xs text-primary">+45 this week</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Deal Views</p>
                    <p className="text-2xl font-bold text-foreground">89,234</p>
                    <p className="text-xs text-primary">+2,345 this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
