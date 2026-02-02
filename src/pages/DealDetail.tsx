import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, ShoppingCart, MapPin, Clock, ArrowLeft, Loader2, CheckCircle, ShieldCheck, Ticket, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useVerification, useClaims, useRatings } from "@/hooks/useDeals";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { differenceInDays, parseISO, format } from "date-fns";
import { toast } from "sonner";

const DealDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();

  const { data: deal, isLoading, error } = useQuery({
    queryKey: ["deal", id],
    queryFn: async () => {
      const { data } = await api.get(`/deals/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const { data: verifications, verifyDeal } = useVerification(id || "");
  const { claimDeal } = useClaims();
  const { data: ratings, addRating } = useRatings(deal?.business_id || "");

  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to write a review");
      return;
    }
    setIsSubmittingReview(true);
    addRating.mutate({
      business_id: deal.business_id,
      rating: userRating,
      comment: userComment
    }, {
      onSuccess: () => {
        setUserComment("");
        setIsSubmittingReview(false);
      },
      onError: () => setIsSubmittingReview(false)
    });
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
                  <Badge variant="outline">{getExpiryText(deal.expiry_date || "", (deal as any).is_perpetual)}</Badge>
                </div>
                <h1 className="text-3xl font-bold mb-2 text-card-foreground">{deal.title}</h1>
                <p className="text-lg text-muted-foreground">{deal.business_name}</p>

                <div className="flex flex-wrap gap-2 mt-3 text-sm">
                  {deal.category_name && (
                    <Badge variant="secondary">{deal.category_name}</Badge>
                  )}
                  {verifications?.count > 0 && (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 flex gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verified by {verifications.count} users
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="icon" variant="outline" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="text-green-600 border-green-200"
                  onClick={() => verifyDeal.mutate()}
                  title="Verify this deal works!"
                >
                  <CheckCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {(deal as any).total_quantity && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-destructive flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Hurry! Only {(deal as any).total_quantity - (deal as any).claimed_count} left
                  </span>
                  <span className="text-muted-foreground">{(deal as any).claimed_count} claimed</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive transition-all"
                    style={{ width: `${Math.min(100, ((deal as any).claimed_count / (deal as any).total_quantity) * 100)}%` }}
                  />
                </div>
              </div>
            )}
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
                      : `Valid from ${format(parseISO(deal.start_date || ""), "MMM d, yyyy")} to ${format(parseISO(deal.expiry_date || ""), "MMM d, yyyy")}`
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

            <div className="flex gap-2">
              <Button
                className="flex-1"
                size="lg"
                variant={inCart ? "secondary" : "default"}
                onClick={handleAddToCart}
                disabled={inCart || addToCart.isPending}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {inCart ? "In Cart" : "Add to Cart"}
              </Button>
              <Button
                className="flex-1"
                size="lg"
                variant="destructive"
                onClick={() => claimDeal.mutate(deal.id)}
                disabled={claimDeal.isPending || ((deal as any).total_quantity && (deal as any).claimed_count >= (deal as any).total_quantity)}
              >
                {claimDeal.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ticket className="h-4 w-4 mr-2" />}
                Claim Deal
              </Button>
            </div>

            <Separator className="my-8" />

            {/* Reviews Section */}
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-xl mb-4 text-card-foreground">Customer Reviews</h3>
                {ratings && ratings.length > 0 ? (
                  <div className="space-y-4">
                    {ratings.map((r: any) => (
                      <div key={r.id} className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">{r.User?.full_name || "Customer"}</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No reviews yet. Be the first to review!</p>
                )}
              </div>

              {user && (
                <form onSubmit={handleReviewSubmit} className="space-y-4 bg-muted/20 p-6 rounded-xl border border-border">
                  <h4 className="font-semibold">Write a Review</h4>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="focus:outline-none"
                      >
                        <Star className={`h-6 w-6 ${star <= userRating ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary/50"}`} />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Share your experience with this business..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    required
                    rows={3}
                  />
                  <Button type="submit" disabled={isSubmittingReview || !userComment}>
                    {isSubmittingReview && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Submit Review
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DealDetail;
