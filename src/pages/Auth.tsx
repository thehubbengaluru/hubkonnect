import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConcentricCircles from "@/components/ConcentricCircles";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <ConcentricCircles className="absolute inset-0 w-full h-full text-primary pointer-events-none opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 to-background pointer-events-none" />

      <Card className="relative z-10 w-full max-w-md rounded-card shadow-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-2">
            <span className="text-primary-foreground font-accent font-bold text-xl">H</span>
          </div>
          <CardTitle className="text-2xl">{isLogin ? "Welcome back" : "Join the community"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to discover your matches"
              : "Create your account to start connecting"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full rounded-button font-semibold" size="lg">
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-accent font-medium hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
