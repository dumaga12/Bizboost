import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bookmark } from "lucide-react";

const SavedDeals = () => {
  const savedDeals = [
    { id: 1, title: "50% Off Premium Coffee", business: "Java House", category: "Food & Drink", discount: "50%", expires: "2 days left", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop" },
    { id: 3, title: "30% Off Summer Collection", business: "Fashion Hub", category: "Fashion", discount: "30%", expires: "1 week left", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop" },
  ];

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

        {savedDeals.length === 0 ? (
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
            {savedDeals.map((deal) => (
              <Link key={deal.id} to={`/deals/${deal.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={deal.image} 
                      alt={deal.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader className="pt-3">
                    <div className="flex items-start justify-between">
                      <Badge className="bg-destructive text-destructive-foreground">{deal.discount}</Badge>
                      <Badge variant="outline">{deal.expires}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-bold text-lg mb-2 text-card-foreground">{deal.title}</h4>
                    <p className="text-sm text-muted-foreground">{deal.business}</p>
                    <Badge variant="secondary" className="mt-2">{deal.category}</Badge>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">View Deal</Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedDeals;