import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ConcentricCircles from "@/components/ConcentricCircles";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-secondary">
      <ConcentricCircles className="absolute inset-0 w-full h-full text-foreground pointer-events-none" />

      <div className="relative z-10 w-full max-w-md border-2 border-foreground bg-background shadow-brutal-lg p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-block border-2 border-foreground bg-accent h-14 w-14 flex items-center justify-center mx-auto shadow-brutal-sm">
            <span className="font-heading text-2xl">H</span>
          </div>
          <h1 className="font-heading text-3xl uppercase">
            {isLogin ? "Welcome back" : "Join the hub"}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            {isLogin
              ? "Sign in to discover your matches"
              : "Create your account to start connecting"}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono text-sm font-bold uppercase tracking-wider">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-foreground bg-background font-mono h-12 focus:ring-accent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-mono text-sm font-bold uppercase tracking-wider">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-foreground bg-background font-mono h-12 focus:ring-accent"
            />
          </div>
          <Button className="w-full h-12 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider text-base">
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
          <p className="text-center font-mono text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-bold text-foreground underline decoration-accent decoration-2 underline-offset-2 hover:bg-accent transition-colors"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
