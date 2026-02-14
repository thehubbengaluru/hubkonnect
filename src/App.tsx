import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import FirstMatches from "./pages/FirstMatches";
import ForYou from "./pages/ForYou";
import Connections from "./pages/Connections";
import Profile from "./pages/Profile";
import MyProfile from "./pages/MyProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
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
            <Route path="/profile" element={
              <ProtectedRoute><MyProfile /></ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
