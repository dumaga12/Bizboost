import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, TrendingUp, Plus, Edit, Trash2, Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessDeals, Deal } from "@/hooks/useDeals";
import api from "@/api/axios";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

const BizDashboard = () => {
  const navigate = useNavigate();
  const { user, business, loading: authLoading, signOut } = useAuth();
  const { data: deals, isLoading: dealsLoading } = useBusinessDeals(business?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/business/login");
    }
    if (!authLoading && user && !business) {
      navigate("/business/register");
    }
  }, [user, business, authLoading, navigate]);

  const handleDelete = async (dealId: string) => {
    try {
      await api.delete(`/deals/${dealId}`);
      toast({ title: "Success", description: "Deal deleted" });
      queryClient.invalidateQueries({ queryKey: ["business-deals"] });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || error.message, variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusColor = (deal: Deal): "default" | "secondary" | "destructive" => {
    if (deal.status === "active") return "default";
    if (deal.status === "draft") return "secondary";
    return "destructive";
  };

  const activeDeals = deals?.filter(d => d.status === "active").length || 0;
  const totalViews = deals?.reduce((sum, d) => sum + d.view_count, 0) || 0;

  const stats = [
    { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye },
    { label: "Active Deals", value: activeDeals.toString(), icon: TrendingUp },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      { }
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Business Dashboard</h1>
              <p className="text-sm text-muted-foreground">{business?.business_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/business/deals/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Deal
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        { }
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

        { }
        <Card>
          <CardHeader>
            <CardTitle>Your Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {dealsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : deals && deals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">{deal.title}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(deal)}>
                          {deal.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{deal.view_count}</TableCell>
                      <TableCell>{format(parseISO(deal.end_date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/business/deals/${deal.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(deal.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No deals yet. Post your first deal!</p>
                <Link to="/business/deals/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Deal
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BizDashboard;
