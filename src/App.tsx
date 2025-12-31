import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Room from "./pages/Room";
import Explore from "./pages/Explore";
import AstarAI from "./pages/AstarAI";
import Board from "./pages/Board";
import Stats from "./pages/Stats";
import Friends from "./pages/Friends";
import PlanetLanding from "./pages/PlanetLanding";
import Sources from "./pages/Sources";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import OnboardingComplete from "./pages/OnboardingComplete";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Onboarding routes (requires auth but not onboarding completion) */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding/complete" element={<OnboardingComplete />} />
            
            {/* Protected routes (requires auth + onboarding completion) */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/room" element={<ProtectedRoute><Room /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
            <Route path="/astar-ai" element={<ProtectedRoute><AstarAI /></ProtectedRoute>} />
            <Route path="/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
            <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            <Route path="/planet/:subjectName" element={<ProtectedRoute><PlanetLanding /></ProtectedRoute>} />
            <Route path="/planets/:planetId/sources" element={<ProtectedRoute><Sources /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
