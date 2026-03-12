import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

// Eager-load landing + auth (critical path)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Lazy-load everything behind auth
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const FirstMatches = lazy(() => import("./pages/FirstMatches"));
const ForYou = lazy(() => import("./pages/ForYou"));
const Connections = lazy(() => import("./pages/Connections"));
const Messages = lazy(() => import("./pages/Messages"));
const Profile = lazy(() => import("./pages/Profile"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Pitch = lazy(() => import("./pages/Pitch"));
const Admin = lazy(() => import("./pages/Admin"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        // Don't retry auth errors
        if (error?.message?.includes("JWT") || error?.message?.includes("token") || error?.status === 401) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: any) => {
        if (error?.message?.includes("JWT expired") || error?.message?.includes("Invalid Refresh Token")) {
          window.location.href = "/login";
        }
      },
    },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="h-8 w-8 border-2 border-foreground border-t-transparent animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/onboarding" element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/matches" element={
              <ProtectedRoute requireOnboarding={false}>
                <FirstMatches />
              </ProtectedRoute>
            } />
            <Route path="/for-you" element={
              <ProtectedRoute><ForYou /></ProtectedRoute>
            } />
            <Route path="/connections" element={
              <ProtectedRoute><Connections /></ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute><Messages /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><MyProfile /></ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/pitch" element={<Pitch />} />
            <Route path="/admin" element={
              <ProtectedRoute><Admin /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
