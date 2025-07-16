import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import SampleFeed from "@/components/SampleFeed";
import Footer from "@/components/Footer";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to the feed
    if (user) {
      navigate("/feed");
    }
  }, [user, navigate]);

  // Show landing page for non-authenticated users
  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background font-interface">
      <Navigation />
      <Hero />
      <FeaturesSection />
      <SampleFeed />
      <Footer />
    </div>
  );
};

export default Index;
