import { useState, useEffect } from "react";
import api from "@/api/axios";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
<<<<<<< HEAD
=======
import { useAuth } from "@/contexts/AuthContext";
>>>>>>> de0c80683a03b59c4d843bd00c59fbfd1c9745bd
import { useToast } from "@/hooks/use-toast";

const BizRegister = () => {
  const navigate = useNavigate();
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
<<<<<<< HEAD
=======

>>>>>>> de0c80683a03b59c4d843bd00c59fbfd1c9745bd
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setIsLoading(true);

<<<<<<< HEAD
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/business/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: formData.businessName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          description: formData.description,
          password: formData.password,
        }),
      });

      const data = await res.json();
=======
    // 1. Sign up the user
    // The signUp function from AuthContext expects (email, password, name)
    const { error: signUpError } = await signUp(formData.email, formData.password, formData.businessName);

    if (signUpError) {
>>>>>>> de0c80683a03b59c4d843bd00c59fbfd1c9745bd
      setIsLoading(false);

      if (!res.ok) {
        toast({ title: "Error", description: data.message || "Failed to register business", variant: "destructive" });
        return;
      }

<<<<<<< HEAD
      toast({ title: "Success", description: "Business registered successfully!" });
      navigate("/business/dashboard");
    } catch (error: any) {
      setIsLoading(false);
      toast({ title: "Error", description: error.message || "Something went wrong", variant: "destructive" });
    }
=======
    // 2. Create the business profile
    // Note: The backend registration endpoint likely handles user creation + business profile creation
    // If not, we should have a dedicated endpoint for this.
    // Assuming /auth/register creates the user, we then need to create the business profile.

    // However, if the user is already logged in (from step 1), we can just create the business.
    // Let's assume the user is logged in automatically or we rely on the auth context user.

    if (!user) {
      // If signUp didn't automatically login or set user context immediately, we might need to wait or manual login.
      // But let's try to create the business profile associated with the current user context if available
      // OR, better yet, the previous signUp call should have handled it.

      // Looking at AuthContext, signUp just calls /auth/register.
      // We might need to call a separate endpoint to register the business details.
      setIsLoading(false);
      toast({ title: "Error", description: "User not found after registration. Please try again.", variant: "destructive" });
      return;
    }

    try {
      await api.post("/businesses", {
        business_name: formData.businessName,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        user_id: user?.id // or handle if user is not yet set in context
      });
    } catch (bizError: any) {
      setIsLoading(false);
      toast({ title: "Error", description: bizError.response?.data?.message || bizError.message, variant: "destructive" });
      return;
    }

    setIsLoading(false);
    toast({ title: "Success", description: "Business registered successfully!" });
    navigate("/business/dashboard");
>>>>>>> de0c80683a03b59c4d843bd00c59fbfd1c9745bd
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

<<<<<<< HEAD
=======
            { }
>>>>>>> de0c80683a03b59c4d843bd00c59fbfd1c9745bd
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
<<<<<<< HEAD
                  <Input 
                    id="address" 
                    placeholder="eg wuse2, okocha close, plot 1" 
=======
                  <Input
                    id="address"
                    placeholder="eg wuse2, okocha close, plot 1 "
>>>>>>> de0c80683a03b59c4d843bd00c59fbfd1c9745bd
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
