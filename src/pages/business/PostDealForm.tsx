import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useDeals";
import api from "@/api/axios";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import ImageUpload from "@/components/ImageUpload";

const PostDealForm = () => {
  const navigate = useNavigate();
  const { user, business, loading: authLoading } = useAuth();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    discount_type: "percentage",
    discount_value: "",
    start_date: "",
    end_date: "",
    terms_conditions: "",
    image_url: "",
    status: "active",
    is_perpetual: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/business/login");
    }
    if (!authLoading && user && !business) {
      navigate("/business/register");
    }
  }, [user, business, authLoading, navigate]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (status: "active" | "draft") => {
    if (!business) {
      toast({ title: "Error", description: "No business profile found", variant: "destructive" });
      return;
    }

    if (!formData.title || !formData.description || !formData.discount_value || !formData.start_date) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    // Validate end date if not perpetual
    if (!formData.is_perpetual && !formData.end_date) {
      toast({ title: "Error", description: "Please set an end date or mark as never expires", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    // For perpetual deals, set end_date far in the future
    const endDate = formData.is_perpetual ? "2099-12-31" : formData.end_date;

    try {
      await api.post("/deals", {
        business_id: business.id,
        title: formData.title,
        description: formData.description,
        category: formData.category_id || "General",
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        start_date: formData.start_date,
        end_date: endDate,
        terms_conditions: formData.terms_conditions || null,
        image_url: formData.image_url || null,
        status: status,
        is_perpetual: formData.is_perpetual,
        // Adding dummy prices for now to satisfy the model if needed, or making them optional in model
        original_price: 0,
        discount_price: 0,
      });

      sonnerToast.success(status === "active" ? "Deal published!" : "Deal saved as draft");
      navigate("/business/dashboard");
    } catch (error: any) {
      sonnerToast.error(error.response?.data?.error || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link to="/business/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Post a New Deal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Deal Title *</Label>
              <Input
                id="title"
                placeholder="e.g., 50% Off All Coffee Drinks"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your deal in detail..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category_id} onValueChange={(v) => handleChange("category_id", v)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount Type</Label>
                <Select value={formData.discount_type} onValueChange={(v) => handleChange("discount_type", v)}>
                  <SelectTrigger id="discount_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="bogo">Buy One Get One</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_value">Discount Value *</Label>
              <Input
                id="discount_value"
                placeholder="e.g., 50% or $10 off"
                value={formData.discount_value}
                onChange={(e) => handleChange("discount_value", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
              <Switch
                id="perpetual"
                checked={formData.is_perpetual}
                onCheckedChange={(checked) => handleChange("is_perpetual", checked)}
              />
              <div>
                <Label htmlFor="perpetual" className="cursor-pointer">Never expires</Label>
                <p className="text-sm text-muted-foreground">
                  This deal will remain active indefinitely until you deactivate it
                </p>
              </div>
            </div>

            {!formData.is_perpetual && (
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                placeholder="List any restrictions or requirements..."
                rows={3}
                value={formData.terms_conditions}
                onChange={(e) => handleChange("terms_conditions", e.target.value)}
              />
            </div>

            <ImageUpload
              value={formData.image_url}
              onChange={(url) => handleChange("image_url", url)}
              disabled={isSubmitting}
            />

            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={() => handleSubmit("active")}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Publish Deal
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit("draft")}
                disabled={isSubmitting}
              >
                Save as Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostDealForm;
