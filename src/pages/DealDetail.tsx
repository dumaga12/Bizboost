import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, ShoppingCart, MapPin, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInDays, parseISO, format } from "date-fns";

const DealDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();

  const { data: deal, isLoading, error } = useQuery({
    queryKey: ["deal", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals_with_details")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getExpiryText = (endDate: string, isPerpetual?: boolean): string => {
    if (isPerpetual) return "Never expires";
    const days = differenceInDays(parseISO(endDate), new Date());
    if (days < 0) return "Expired";
    if (days === 0) return "Ends today";
    if (days === 1) return "1 day left";
    if (days < 7) return `${days} days left`;
    return `Valid until ${format(parseISO(endDate), "MMM d, yyyy")}`;
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/customer/login");
      return;
    }
    if (deal?.id) {
      addToCart.mutate(deal.id);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: deal?.title,
        text: `Check out this deal: ${deal?.title} - ${deal?.discount_value} off!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Deals
              </Button>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Deal not found</h1>
          <p className="text-muted-foreground mb-6">This deal may have been removed or expired.</p>
          <Link to="/browse">
            <Button>Browse Other Deals</Button>
          </Link>
        </div>
      </div>
    );
  }

  const inCart = deal.id ? isInCart(deal.id) : false;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deals
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="overflow-hidden">
          {/* Deal Image */}
          {deal.image_url && (
            <div className="h-64 overflow-hidden">
              <img 
                src={deal.image_url} 
                alt={deal.title || "Deal image"}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-destructive text-destructive-foreground">{deal.discount_value}</Badge>
                  <Badge variant="outline">{getExpiryText(deal.end_date || "", (deal as any).is_perpetual)}</Badge>
                </div>
                <h1 className="text-3xl font-bold mb-2 text-card-foreground">{deal.title}</h1>
                <p className="text-lg text-muted-foreground">{deal.business_name}</p>
                {deal.category_name && (
                  <Badge variant="secondary" className="mt-2">{deal.category_name}</Badge>
                )}
              </div>
              <Button size="icon" variant="outline" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-card-foreground">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{deal.description}</p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2 text-card-foreground">Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {(deal as any).is_perpetual 
                      ? "This deal never expires" 
                      : `Valid from ${format(parseISO(deal.start_date || ""), "MMM d, yyyy")} to ${format(parseISO(deal.end_date || ""), "MMM d, yyyy")}`
                    }
                  </span>
                </div>
                {deal.business_name && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{deal.business_name}</span>
                  </div>
                )}
              </div>
            </div>

            {deal.terms_conditions && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-card-foreground">Terms & Conditions</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{deal.terms_conditions}</p>
                </div>
              </>
            )}

            <Button 
              className="w-full" 
              size="lg"
              variant={inCart ? "secondary" : "default"}
              onClick={handleAddToCart}
              disabled={inCart || addToCart.isPending}
            >
              {addToCart.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              {inCart ? "Already in Cart" : "Add to Cart"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DealDetail;
