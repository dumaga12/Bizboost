import { useState } from "react";
import api from "@/api/axios";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const BizRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, user } = useAuth();

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepNum) => {
    if (stepNum === 1) {
      if (!formData.businessName || !formData.email || !formData.phone) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return false;
      }
    }

    if (stepNum === 2) {
      if (!formData.address || !formData.description) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.businessName
    );

    if (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Signup failed",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "User not found after signup",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/businesses", {
        business_name: formData.businessName,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        user_id: user.id,
      });

      toast({
        title: "Success",
        description: "Business registered successfully!",
      });

      navigate("/business/dashboard");
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Register Your Business</CardTitle>
            <CardDescription>Step {step} of 3</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <Input
                  placeholder="Business Name"
                  value={formData.businessName}
                  onChange={(e) =>
                    handleChange("businessName", e.target.value)
                  }
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                <Input
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
                <Textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    handleChange("description", e.target.value)
                  }
                />
              </>
            )}

            {step === 3 && (
              <>
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                />
              </>
            )}

            <div className="flex gap-2">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </Button>
              )}

              {step < 3 ? (
                <Button onClick={handleNext} className="flex-1">
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Complete Registration
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BizRegister;
