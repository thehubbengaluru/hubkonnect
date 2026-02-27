import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ConcentricCircles from "@/components/ConcentricCircles";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check hash for recovery token
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      toast({ title: "Password updated!", description: "You can now log in with your new password." });
      navigate("/for-you");
    } catch (err: any) {
      setError(err?.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-secondary">
      <ConcentricCircles className="absolute inset-0 w-full h-full text-foreground pointer-events-none opacity-20" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <button onClick={() => navigate("/login")} className="inline-flex items-center gap-1 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </button>

        <div className="border-2 border-foreground bg-background shadow-brutal-lg p-6 md:p-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex h-14 w-14 border-2 border-foreground bg-accent items-center justify-center mx-auto shadow-brutal-sm">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="font-heading text-2xl md:text-3xl uppercase">Set New Password</h1>
            <p className="font-mono text-sm text-muted-foreground">
              {isRecovery ? "Enter your new password below." : "Waiting for recovery link verification..."}
            </p>
          </div>

          {error && (
            <div className="border-l-4 border-destructive bg-destructive/10 p-3 font-mono text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-mono text-xs font-bold uppercase tracking-wider">New Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-2 border-foreground bg-background font-mono h-12"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs font-bold uppercase tracking-wider">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="border-2 border-foreground bg-background font-mono h-12"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !isRecovery}
              className="w-full h-14 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider text-sm"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
