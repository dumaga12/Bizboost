import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Tag, TrendingUp, Loader2, ShoppingCart, LogOut, User, Heart, Star, Ticket, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useTrendingDeals, useCategories, useWishlist } from "@/hooks/useDeals";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInDays, parseISO } from "date-fns";

const Home = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const { data: deals, isLoading: dealsLoading } = useTrendingDeals(4);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { user, signOut } = useAuth();
  const { cartCount, addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, data: wishlist } = useWishlist();

  const isWishlisted = (dealId: string) => {
    return wishlist?.some((item: any) => item.deal_id === String(dealId));
  };

  const handleWishlist = (e: React.MouseEvent, dealId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/customer/login");
      return;
    }
    if (isWishlisted(dealId)) {
      removeFromWishlist.mutate(dealId);
    } else {
      addToWishlist.mutate(dealId);
    }
  };

  const getExpiryText = (endDate: string, isPerpetual?: boolean): string => {
    if (isPerpetual) return "Never expires";
    const days = differenceInDays(parseISO(endDate), new Date());
    if (days < 0) return "Expired";
    if (days === 0) return "Ends today";
    if (days === 1) return "1 day left";
    if (days < 7) return `${days} days left`;
    if (days < 14) return "1 week left";
    return `${Math.ceil(days / 7)} weeks left`;
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchInput)}`);
    } else {
      navigate("/browse");
    }
  };

  const handleAddToCart = (e: React.MouseEvent, dealId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/customer/login");
      return;
    }
    addToCart.mutate(dealId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">BizBoost</h1>
          <nav className="flex items-center gap-4">
            <Link to="/browse">
              <Button variant="ghost">Browse Deals</Button>
            </Link>
            <Link to="/customer/claims">
              <Button variant="ghost" size="icon">
                <Ticket className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/customer/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            {user ? (
              <>
                <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full text-primary font-bold text-sm">
                  <Coins className="h-4 w-4" />
                  <span>{(user as any).points || 0}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => signOut()}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Link to="/customer/login">
                <Button variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
            <Link to="/business/login">
              <Button>Business Portal</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">Find Amazing Business products and services Near You</h2>
          <p className="text-xl mb-8 text-primary-foreground/80">Discover exclusive offers from local businesses</p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for deals, businesses, or categories..."
                  className="pl-10 h-12 bg-background"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button size="lg" variant="secondary" onClick={handleSearch}>Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          {categoriesLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap justify-center">
              {categories?.map((cat) => (
                <Link key={cat.id} to={`/browse?category=${cat.id}`}>
                  <Badge variant="secondary" className="px-4 py-2 cursor-pointer hover:bg-accent">
                    <Tag className="h-4 w-4 mr-1" />
                    {cat.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Deals */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h3 className="text-3xl font-bold text-foreground">Trending Deals</h3>
        </div>

        {dealsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : deals && deals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deals.map((deal) => (
              <Link key={deal.id} to={`/deals/${deal.id}`}>
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
                  <CardHeader className="pt-3">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <Badge className="bg-destructive text-destructive-foreground">{deal.discount_value}</Badge>
                        <div className="flex items-center text-yellow-500 text-xs mt-1">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          <span>4.5</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline">{getExpiryText(deal.expiry_date, (deal as any).is_perpetual)}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleWishlist(e, deal.id)}
                        >
                          <Heart className={`h-5 w-5 ${isWishlisted(deal.id) ? "fill-destructive text-destructive" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-bold text-lg mb-2 text-card-foreground">{deal.title}</h4>
                    <p className="text-sm text-muted-foreground">{deal.business_name}</p>
                    {deal.category_name && (
                      <Badge variant="secondary" className="mt-2">{deal.category_name}</Badge>
                    )}

                    {(deal as any).total_quantity && (
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{(deal as any).claimed_count} claimed</span>
                          <span>{(deal as any).total_quantity - (deal as any).claimed_count} left</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, ((deal as any).claimed_count / (deal as any).total_quantity) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button
                      className="flex-1"
                      variant={isInCart(deal.id) ? "secondary" : "default"}
                      onClick={(e) => handleAddToCart(e, deal.id)}
                      disabled={isInCart(deal.id)}
                    >
                      {isInCart(deal.id) ? "In Cart" : "Add to Cart"}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No deals available yet. Be the first business to post a deal!</p>
              <Link to="/business/register">
                <Button className="mt-4">Register Your Business</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* CTA for Businesses */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4 text-foreground">Are you a business owner?</h3>
          <p className="text-muted-foreground mb-6 text-lg">Post your deals and reach thousands of customers</p>
          <Link to="/business/register">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
