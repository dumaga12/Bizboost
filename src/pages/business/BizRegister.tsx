import { useState } from "react";
import api from "@/api/axios";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const BizRegister = () => {
  const navigate = useNavigate();
  const { signUp, signIn, updateToken, user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      if (!formData.businessName || !formData.email || !formData.phone) {
        toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
        return false;
      }
    } else if (stepNum === 2) {
      if (!formData.address || !formData.description) {
        toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!formData.password || !formData.confirmPassword) {
      toast({ title: "Error", description: "Please enter a password", variant: "destructive" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up the user
      const { error: signUpError } = await signUp(formData.email, formData.password, formData.businessName, "business");

      if (signUpError) {
        setIsLoading(false);
        toast({ title: "Error", description: signUpError as string || "Failed to register business", variant: "destructive" });
        return;
      }

      // 2. Sign in immediately to get the token and user ID
      const { error: signInError } = await signIn(formData.email, formData.password);

      if (signInError) {
        setIsLoading(false);
        toast({ title: "Error", description: "Registration successful, but failed to log in. Please log in manually.", variant: "destructive" });
        navigate("/business/login");
        return;
      }

      // Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Create the business profile
      const { data } = await api.post("/business", {
        business_name: formData.businessName,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
      });

      // Update token if returned (backend now returns new token with business role)
      if (data.token && user) {
        updateToken(data.token, { ...user!, role: "business" });
      }

      setIsLoading(false);
      toast({ title: "Success", description: "Business registered successfully!" });
      navigate("/business/dashboard");

    } catch (error: any) {
      setIsLoading(false);
      toast({ title: "Error", description: error.response?.data?.message || error.message || "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Register Your Business</CardTitle>
            <CardDescription>Step {step} of 3</CardDescription>

            <div className="flex items-center gap-2 mt-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {step > 1 ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <div className={`h-1 flex-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {step > 2 ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <div className={`h-1 flex-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                3
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    placeholder="Your Business Name"
                    value={formData.businessName}
                    onChange={(e) => handleChange("businessName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-email">Business Email</Label>
                  <Input
                    id="business-email"
                    type="email"
                    placeholder="contact@yourbusiness.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(234)09093097369"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    placeholder="eg wuse2, okocha close, plot 1 "
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell customers about your business..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  />
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    By registering, you agree to our Terms of Service and Privacy Policy.
                    Your business will be reviewed by our team before approval.
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isLoading}>
                  Previous
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={handleNext} className="flex-1">
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Complete Registration
                </Button>
              )}
            </div>

            {step === 1 && (
              <div className="text-sm text-muted-foreground text-center pt-2">
                Already have an account?{" "}
                <Link to="/business/login" className="text-primary hover:underline">
                  Login here
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BizRegister;
