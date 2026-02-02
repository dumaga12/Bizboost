import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, ShoppingCart, Loader2, QrCode } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, parseISO } from "date-fns";

const Cart = () => {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, isLoading, removeFromCart, clearCart } = useCart();

  const getExpiryText = (expiryDate: string, isPerpetual: boolean): string => {
    if (isPerpetual) return "Never expires";
    const days = differenceInDays(parseISO(expiryDate), new Date());
    if (days < 0) return "Expired";
    if (days === 0) return "Ends today";
    if (days === 1) return "1 day left";
    if (days < 7) return `${days} days left`;
    return `${Math.ceil(days / 7)} weeks left`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
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

        <div className="container mx-auto px-4 py-12 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sign in to view your cart</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to save deals to your cart
          </p>
          <Link to="/customer/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deals
            </Button>
          </Link>
          {cartItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearCart.mutate()}
              disabled={clearCart.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <Badge variant="secondary" className="ml-2">
            {cartItems.length} {cartItems.length === 1 ? "deal" : "deals"}
          </Badge>
        </div>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-4">
                Browse deals and add them to your cart to redeem at the business
              </p>
              <Link to="/browse">
                <Button>Browse Deals</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-32 bg-muted flex-shrink-0">
                    {item.deal?.image_url ? (
                      <img
                        src={item.deal.image_url}
                        alt={item.deal.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-destructive text-destructive-foreground">
                            {item.deal?.discount_value}
                          </Badge>
                          <Badge variant="outline">
                            {item.deal ? getExpiryText(item.deal.expiry_date, item.deal.is_perpetual) : ""}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-lg">{item.deal?.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.deal?.business_name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {item.deal?.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart.mutate(item.id)}
                        disabled={removeFromCart.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  How to Redeem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Show this cart to the business when you visit to redeem your deals.
                  The business will verify and apply the discounts to your purchase.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
