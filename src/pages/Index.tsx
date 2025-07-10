import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import SampleFeed from "@/components/SampleFeed";
import Footer from "@/components/Footer";

const Index = () => {
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
