import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Header from "@/components/Header";
import ChatWidget from "@/components/ChatWidget";
import Globe3D from "@/components/Globe3D";
import CVUpload from "@/components/CVUpload";
import Questionnaire from "@/components/Questionnaire";
import { Rocket, Play } from "lucide-react";
import { CVAnalysis, UserProfile } from "@/types";

export default function Home() {
  const [currentView, setCurrentView] = useState<"hero" | "upload" | "questionnaire">("hero");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleCVAnalysis = (analysis: CVAnalysis, cvText: string) => {
    const profile: UserProfile = {
      email: "user@example.com",
      name: "CV User",
      cvText,
      skills: analysis.skills,
      interests: analysis.interests,
      goals: analysis.recommendedTypes,
      education: analysis.experienceLevel,
    };
    setUserProfile(profile);
    // Redirect to dashboard will be handled by CVUpload component
  };

  const handleQuestionnaireComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    window.location.href = "/dashboard";
  };

  if (currentView === "upload") {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-24">
          <CVUpload onAnalysisComplete={handleCVAnalysis} />
        </div>
        <ChatWidget />
      </div>
    );
  }

  if (currentView === "questionnaire") {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-24">
          <Questionnaire onComplete={handleQuestionnaireComplete} />
        </div>
        <ChatWidget />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        {/* Background Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="particle animate-float"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Text */}
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h2 className="text-6xl font-bold leading-tight">
                  Discover Your
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {" "}Perfect Opportunity
                  </span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Our AI-powered platform analyzes your profile and matches you with internships, 
                  study abroad programs, grants, and career opportunities from around the world.
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="px-8 py-4 ai-gradient text-lg font-semibold hover:scale-105 transition-all duration-300 ai-glow"
                  onClick={() => setCurrentView("upload")}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Get Started Now
                </Button>
                <Button 
                  variant="outline"
                  className="px-8 py-4 glass-card text-lg font-semibold hover:bg-white/10 transition-all duration-300"
                  onClick={() => setCurrentView("questionnaire")}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Take Quiz Instead
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">50K+</div>
                  <div className="text-sm text-gray-400">Opportunities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">98%</div>
                  <div className="text-sm text-gray-400">Match Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">180+</div>
                  <div className="text-sm text-gray-400">Countries</div>
                </div>
              </div>
            </div>
            
            {/* Right Column - 3D Globe */}
            <div className="relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Globe3D />
            </div>
          </div>
        </div>
      </section>
      
      <ChatWidget />
    </div>
  );
}
