import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CloudUpload, Brain, Zap, Bot } from "lucide-react";
import { useAnalyzeCV } from "@/hooks/useAI";
import { CVAnalysis, UploadProgress } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface CVUploadProps {
  onAnalysisComplete: (analysis: CVAnalysis, cvText: string) => void;
}

export default function CVUpload({ onAnalysisComplete }: CVUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const analyzeCV = useAnalyzeCV();
  const { toast } = useToast();

  const simulateUploadProgress = useCallback(async (cvText: string) => {
    const steps = [
      { progress: 25, status: "Extracting text from document..." },
      { progress: 50, status: "Analyzing skills and experience..." },
      { progress: 75, status: "Matching with opportunities..." },
      { progress: 100, status: "Analysis complete!" }
    ];

    for (const step of steps) {
      setUploadProgress({ ...step, isComplete: false });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      const result = await analyzeCV.mutateAsync({ cvText });
      onAnalysisComplete(result.analysis, cvText);
      setUploadProgress({ progress: 100, status: "Analysis complete!", isComplete: true });
      
      toast({
        title: "CV Analysis Complete",
        description: "Your CV has been successfully analyzed. Redirecting to dashboard...",
      });

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze your CV. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(null);
    }
  }, [analyzeCV, onAnalysisComplete, toast]);

  const handleFileRead = (text: string) => {
    simulateUploadProgress(text);
  };

  const handleFileSelect = (file: File) => {
    if (file.type === "application/pdf") {
      // For demo purposes, we'll use placeholder text for PDF files
      const placeholderText = `
        John Doe
        Software Engineer
        Email: john.doe@email.com
        
        EXPERIENCE:
        - Software Developer at Tech Corp (2021-2023)
        - Intern at StartupXYZ (2020-2021)
        
        SKILLS:
        JavaScript, React, Python, Node.js, Machine Learning, Data Analysis
        
        EDUCATION:
        Bachelor of Computer Science, University ABC (2020)
        
        PROJECTS:
        - AI Chat Application using OpenAI API
        - E-commerce platform with React and Node.js
        - Data visualization dashboard with Python
      `;
      handleFileRead(placeholderText);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        handleFileRead(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };
    input.click();
  };

  if (uploadProgress) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Analyzing Your CV</h2>
            <p className="text-xl text-gray-300">Our AI is processing your information</p>
          </div>
          
          <Card className="glass-card p-8 max-w-2xl mx-auto">
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Processing...</span>
                <span className="text-green-400 font-bold">{uploadProgress.progress}%</span>
              </div>
              
              <Progress value={uploadProgress.progress} className="h-3">
                <div 
                  className="progress-bar h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </Progress>
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Bot className="w-4 h-4 text-green-400" />
                <span>{uploadProgress.status}</span>
              </div>
              
              {uploadProgress.isComplete && (
                <div className="text-center text-green-400 font-medium">
                  Redirecting to dashboard...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Upload Your CV</h2>
          <p className="text-xl text-gray-300">Let our AI analyze your experience and skills</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Upload Area */}
          <div className="space-y-6">
            <div 
              className={`upload-zone p-12 rounded-2xl text-center cursor-pointer transition-all duration-300 ${
                isDragOver ? "scale-105 border-green-400" : ""
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-400/20 rounded-full flex items-center justify-center">
                  <CloudUpload className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold">Drag & Drop Your CV</h3>
                <p className="text-gray-400">or click to browse files</p>
                <div className="text-sm text-gray-500">
                  Supports PDF, DOC, DOCX, TXT (Max 10MB)
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Analysis Preview */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Brain className="w-5 h-5 text-green-400 mr-2" />
                  AI Analysis Preview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Skills Extracted</span>
                    <span className="text-green-400 font-bold">Pending Upload</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Experience Level</span>
                    <span className="text-blue-400 font-bold">Analyzing...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Matching Opportunities</span>
                    <span className="text-orange-400 font-bold">Ready to Match</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Skills Preview */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Expected Skills Detection</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm">Programming Languages</span>
                  <span className="px-3 py-1 bg-blue-400/20 text-blue-400 rounded-full text-sm">Frameworks</span>
                  <span className="px-3 py-1 bg-purple-400/20 text-purple-400 rounded-full text-sm">Tools & Technologies</span>
                  <span className="px-3 py-1 bg-orange-400/20 text-orange-400 rounded-full text-sm">Soft Skills</span>
                </div>
              </CardContent>
            </Card>
            
            {/* AI Assistant */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4 flex items-center">
                  <Bot className="w-5 h-5 text-green-400 mr-2" />
                  AI Assistant
                </h4>
                <div className="space-y-4">
                  <div className="chat-bubble p-4 rounded-lg">
                    <p className="text-sm">
                      I'm ready to analyze your CV! Upload your document and I'll extract your skills, 
                      experience, and match you with the best opportunities available.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">AI is ready</span>
                    <Zap className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
