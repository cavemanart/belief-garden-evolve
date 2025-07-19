import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import WriteEssay from "./pages/WriteEssay";
import CreateHotTake from "./pages/CreateHotTake";
import Feed from "./pages/Feed";
import Article from "./pages/Article";
import Explore from "./pages/Explore";
import Onboarding from "./pages/Onboarding";
import CreatorProfile from "./pages/CreatorProfile";
import EmailComposer from "./pages/EmailComposer";
import PaymentSettings from "./pages/PaymentSettings";
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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/write" element={<WriteEssay />} />
            <Route path="/hot-take" element={<CreateHotTake />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/creator/:userId" element={<CreatorProfile />} />
            <Route path="/email-composer" element={<EmailComposer />} />
            <Route path="/payment-settings" element={<PaymentSettings />} />
            <Route path="/article/:id" element={<Article />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
