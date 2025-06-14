import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

// This component provides a placeholder for 3D globe visualization
// In a real implementation, you would use Three.js or similar library
export default function Globe3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Placeholder for 3D globe initialization
    // In a real implementation, you would initialize Three.js scene here
    console.log("Globe3D initialized");
  }, []);

  return (
    <Card className="glass-card rounded-2xl h-96 relative overflow-hidden">
      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center relative"
        style={{
          background: `url('https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600') center/cover`,
        }}
      >
        {/* Globe overlay with floating particles */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        
        {/* Floating opportunity markers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-80 h-80">
            {/* Opportunity Markers */}
            <div 
              className="absolute w-4 h-4 bg-green-400 rounded-full animate-pulse-slow shadow-lg cursor-pointer hover:scale-125 transition-transform"
              style={{ top: '25%', left: '33%' }}
              title="Silicon Valley Internships"
            />
            <div 
              className="absolute w-4 h-4 bg-orange-400 rounded-full animate-pulse-slow shadow-lg cursor-pointer hover:scale-125 transition-transform"
              style={{ top: '50%', right: '25%' }}
              title="European Study Programs"
            />
            <div 
              className="absolute w-4 h-4 bg-blue-400 rounded-full animate-pulse-slow shadow-lg cursor-pointer hover:scale-125 transition-transform"
              style={{ bottom: '33%', left: '50%' }}
              title="Asian Tech Opportunities"
            />
            <div 
              className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-pulse-slow shadow-lg cursor-pointer hover:scale-125 transition-transform"
              style={{ top: '33%', right: '33%' }}
              title="Research Grants"
            />
            
            {/* Connecting Lines - SVG Animation */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(34, 197, 94, 0.3)" />
                  <stop offset="100%" stopColor="rgba(34, 197, 94, 0.1)" />
                </linearGradient>
                <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(251, 146, 60, 0.3)" />
                  <stop offset="100%" stopColor="rgba(251, 146, 60, 0.1)" />
                </linearGradient>
              </defs>
              
              <path
                d="M120 80 Q200 120 280 100"
                stroke="url(#lineGradient1)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
              <path
                d="M100 160 Q180 140 260 180"
                stroke="url(#lineGradient2)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                className="animate-pulse"
                style={{ animationDelay: '1s' }}
              />
            </svg>
          </div>
        </div>
        
        {/* Floating particles */}
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
        
        {/* Central info overlay */}
        <div className="absolute bottom-4 left-4 right-4 glass-card p-4 rounded-lg">
          <div className="text-center">
            <p className="text-sm font-medium text-white mb-2">Global Opportunities</p>
            <div className="flex justify-center space-x-4 text-xs">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Tech Hubs</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Study Programs</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Research Centers</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
