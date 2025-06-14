import { useState } from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import Header from "@/components/Header";
import Globe3D from "@/components/Globe3D";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();

  const handleAuthSuccess = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left Column - Auth Form */}
            <div className="order-2 lg:order-1">
              {isLogin ? (
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToRegister={() => setIsLogin(false)}
                />
              ) : (
                <RegisterForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={() => setIsLogin(true)}
                />
              )}
            </div>
            
            {/* Right Column - Hero Content */}
            <div className="order-1 lg:order-2 space-y-8">
              <div className="text-center lg:text-left space-y-6">
                <h1 className="text-5xl font-bold leading-tight">
                  Your AI-Powered
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {" "}Career Journey
                  </span>
                  <br />
                  Starts Here
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Discover thousands of internships, study abroad programs, grants, and fellowships 
                  tailored specifically to your skills and interests using advanced AI matching.
                </p>
                
                {/* Features List */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">AI-powered CV analysis using OpenAI</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Smart opportunity matching system</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-gray-300">Secure authentication and user profiles</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">Google, Microsoft, UN, and Rhodes opportunities</span>
                  </div>
                </div>
              </div>
              
              {/* 3D Globe */}
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Globe3D />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}