import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ConcentricCircles from "@/components/ConcentricCircles";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase auto-processes the hash fragment on page load
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          setStatus("success");
          // Check if user needs onboarding
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .single();

          setTimeout(() => {
            navigate(profile?.onboarding_completed ? "/for-you" : "/onboarding", { replace: true });
          }, 1500);
        } else {
          // No session — might be email verification without auto-login
          setStatus("success");
          setTimeout(() => navigate("/login", { replace: true }), 2000);
        }
      } catch {
        setStatus("error");
        setTimeout(() => navigate("/login", { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-secondary">
      <ConcentricCircles className="absolute inset-0 w-full h-full text-foreground pointer-events-none opacity-20" />
      <div className="relative z-10 border-2 border-foreground bg-background shadow-brutal-lg p-8 max-w-md w-full text-center space-y-4">
        {status === "loading" && (
          <>
            <div className="h-8 w-8 border-2 border-foreground border-t-transparent animate-spin mx-auto" />
            <p className="font-mono text-sm">Verifying your account...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="h-14 w-14 border-2 border-foreground bg-accent flex items-center justify-center mx-auto">
              <span className="font-heading text-2xl">H</span>
            </div>
            <h1 className="font-heading text-2xl uppercase">Email Verified!</h1>
            <p className="font-mono text-sm text-muted-foreground">Redirecting you now...</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="font-heading text-2xl uppercase text-destructive">Verification Failed</h1>
            <p className="font-mono text-sm text-muted-foreground">
              The link may have expired. Redirecting to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
