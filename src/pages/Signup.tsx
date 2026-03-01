import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ConcentricCircles from "@/components/ConcentricCircles";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "This field is required";
    if (!email.trim()) e.email = "This field is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email";
    if (!password) e.password = "This field is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (!agreed) e.agreed = "You must agree to the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      // If session exists (auto-confirm enabled), go straight to onboarding
      if (data.session) {
        navigate("/onboarding");
      } else {
        toast({
          title: "Account created!",
          description: "Check your email to verify your account before signing in.",
        });
        navigate("/login");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-secondary">
      <ConcentricCircles className="absolute inset-0 w-full h-full text-foreground pointer-events-none opacity-20" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <Link to="/" className="inline-flex items-center gap-1 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="border-2 border-foreground bg-background shadow-brutal-lg p-6 md:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex h-14 w-14 border-2 border-foreground bg-accent items-center justify-center mx-auto shadow-brutal-sm">
              <span className="font-heading text-2xl">H</span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl uppercase">Join Hub Konnect</h1>
            <p className="font-mono text-sm text-muted-foreground">Connect with 500+ creators at The Hub</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-mono text-xs font-bold uppercase tracking-wider">
                Full Name <span className="text-accent">*</span>
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Riya Sharma"
                className="border-2 border-foreground bg-background font-mono h-12"
              />
              {errors.fullName && <p className="font-mono text-xs text-destructive">{errors.fullName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs font-bold uppercase tracking-wider">
                Email <span className="text-accent">*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="riya@example.com"
                className="border-2 border-foreground bg-background font-mono h-12"
              />
              {errors.email && <p className="font-mono text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs font-bold uppercase tracking-wider">
                Password <span className="text-accent">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-2 border-foreground bg-background font-mono h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">At least 8 characters</p>
              {errors.password && <p className="font-mono text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(c) => setAgreed(c === true)}
                className="border-2 border-foreground mt-0.5 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <label htmlFor="terms" className="font-mono text-xs leading-relaxed cursor-pointer">
                I agree to the{" "}
                <a href="#" className="underline decoration-accent decoration-2 underline-offset-2">Terms of Service</a> and{" "}
                <a href="#" className="underline decoration-accent decoration-2 underline-offset-2">Privacy Policy</a>
              </label>
            </div>
            {errors.agreed && <p className="font-mono text-xs text-destructive">{errors.agreed}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider text-sm gap-2 mt-2"
            >
              {loading ? "Creating..." : "Create Account & Continue"} <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center font-mono text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-foreground underline decoration-accent decoration-2 underline-offset-2 hover:bg-accent transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
