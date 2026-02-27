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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      navigate("/for-you");
    } catch (err: any) {
      setError("Invalid email or password. Please try again.");
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
            <h1 className="font-heading text-2xl md:text-3xl uppercase">Welcome back! 👋</h1>
            <p className="font-mono text-sm text-muted-foreground">Log in to continue connecting</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="border-l-4 border-destructive bg-destructive/10 p-3 font-mono text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-mono text-xs font-bold uppercase tracking-wider">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="riya@example.com"
                className="border-2 border-foreground bg-background font-mono h-12"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs font-bold uppercase tracking-wider">Password</Label>
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(c) => setRemember(c === true)}
                  className="border-2 border-foreground data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                />
                <label htmlFor="remember" className="font-mono text-xs cursor-pointer">Remember me</label>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!email) {
                    setError("Enter your email first, then click Forgot password.");
                    return;
                  }
                  try {
                    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (resetErr) throw resetErr;
                    toast({ title: "Check your inbox", description: "A password reset link has been sent to your email." });
                  } catch {
                    toast({ title: "Error", description: "Could not send reset email. Please try again.", variant: "destructive" });
                  }
                }}
                className="font-mono text-xs text-muted-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-foreground transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider text-sm gap-2"
            >
              {loading ? "Logging in..." : "Log In"} <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center font-mono text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-foreground underline decoration-accent decoration-2 underline-offset-2 hover:bg-accent transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
