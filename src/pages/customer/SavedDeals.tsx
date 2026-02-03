import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bookmark, Loader2, Trash2 } from "lucide-react";
import { useWishlist } from "@/hooks/useDeals";

const SavedDeals = () => {
  const { data: wishlist, isLoading, removeFromWishlist } = useWishlist();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const savedDealsItems = wishlist || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Saved Deals</h1>
        </div>

        {savedDealsItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">You haven't saved any deals yet.</p>
              <Link to="/browse">
                <Button className="mt-4">Browse Deals</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedDealsItems.map((item: any) => {
              const deal = item.Deal;
              if (!deal) return null;
              return (
                <div key={item.id} className="relative group">
                  <Link to={`/deals/${deal.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden h-full">
                      <div className="h-40 overflow-hidden bg-muted">
                        {deal.image_url ? (
                          <img
                            src={deal.image_url}
                            alt={deal.title}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                      <CardHeader className="pt-3 pb-2">
                        <div className="flex items-start justify-between">
                          <Badge className="bg-destructive text-destructive-foreground">{deal.discount_value}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <h4 className="font-bold text-lg mb-1 text-card-foreground line-clamp-1">{deal.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{deal.business_name || "Merchant"}</p>
                        <Badge variant="secondary" className="mt-2">{deal.category || "General"}</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWishlist.mutate(deal.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default SavedDeals;