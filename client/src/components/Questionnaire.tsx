import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Bot, Laptop, GraduationCap, DollarSign, HandHeart } from "lucide-react";
import { UserProfile } from "@/types";

interface QuestionnaireProps {
  onComplete: (profile: UserProfile) => void;
}

const questions = [
  {
    id: 1,
    title: "What's your educational background?",
    subtitle: "Help us understand your academic foundation",
    type: "select",
    options: [
      "High School",
      "Bachelor's Degree",
      "Master's Degree",
      "PhD",
      "Professional Certification"
    ]
  },
  {
    id: 2,
    title: "What are your main areas of interest?",
    subtitle: "Select all that apply",
    type: "multi-select",
    options: [
      "Technology & Programming",
      "Data Science & AI",
      "Business & Management",
      "Research & Academia",
      "Arts & Design",
      "Healthcare & Medicine",
      "Environmental Science",
      "International Relations"
    ]
  },
  {
    id: 3,
    title: "What type of opportunities interest you most?",
    subtitle: "Select your preferred opportunity types",
    type: "card-select",
    options: [
      {
        id: "internship",
        title: "Tech Internships",
        description: "Software, AI, Data Science",
        icon: Laptop,
        color: "green"
      },
      {
        id: "study-abroad",
        title: "Study Abroad",
        description: "Exchange programs, degrees",
        icon: GraduationCap,
        color: "blue"
      },
      {
        id: "grant",
        title: "Research Grants",
        description: "Funding for research projects",
        icon: DollarSign,
        color: "orange"
      },
      {
        id: "fellowship",
        title: "Fellowships",
        description: "Professional development",
        icon: HandHeart,
        color: "purple"
      }
    ]
  }
];

export default function Questionnaire({ onComplete }: QuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    skills: [],
    interests: [],
    goals: []
  });

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Update profile based on question
    if (questionId === 1) {
      setProfile(prev => ({ ...prev, education: answer }));
    } else if (questionId === 2) {
      setProfile(prev => ({ ...prev, interests: answer }));
    } else if (questionId === 3) {
      setProfile(prev => ({ ...prev, goals: answer }));
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Complete questionnaire
      const finalProfile: UserProfile = {
        email: "user@example.com", // This would come from auth
        name: "Anonymous User",
        education: answers[1] || "",
        skills: [], // Would be populated from additional questions
        interests: answers[2] || [],
        goals: answers[3] || [],
        ...profile
      };
      onComplete(finalProfile);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const renderQuestionContent = () => {
    const currentAnswer = answers[question.id];

    if (question.type === "select") {
      return (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <Button
              key={option}
              variant={currentAnswer === option ? "default" : "outline"}
              className={`w-full justify-start p-4 h-auto ${
                currentAnswer === option 
                  ? "bg-green-400/20 border-green-400 text-green-400" 
                  : "glass-card hover:bg-white/10"
              }`}
              onClick={() => handleAnswer(question.id, option)}
            >
              {option}
            </Button>
          ))}
        </div>
      );
    }

    if (question.type === "multi-select") {
      return (
        <div className="space-y-3">
          {question.options?.map((option) => {
            const isSelected = currentAnswer?.includes(option);
            return (
              <Button
                key={option}
                variant={isSelected ? "default" : "outline"}
                className={`w-full justify-start p-4 h-auto ${
                  isSelected 
                    ? "bg-green-400/20 border-green-400 text-green-400" 
                    : "glass-card hover:bg-white/10"
                }`}
                onClick={() => {
                  const current = currentAnswer || [];
                  const updated = isSelected 
                    ? current.filter((item: string) => item !== option)
                    : [...current, option];
                  handleAnswer(question.id, updated);
                }}
              >
                {option}
              </Button>
            );
          })}
        </div>
      );
    }

    if (question.type === "card-select") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options?.map((option: any) => {
            const isSelected = currentAnswer?.includes(option.id);
            const Icon = option.icon;
            return (
              <Card
                key={option.id}
                className={`opportunity-card cursor-pointer p-6 transition-all duration-300 ${
                  isSelected ? "neon-border bg-green-400/10" : ""
                }`}
                onClick={() => {
                  const current = currentAnswer || [];
                  const updated = isSelected 
                    ? current.filter((item: string) => item !== option.id)
                    : [...current, option.id];
                  handleAnswer(question.id, updated);
                }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 bg-${option.color}-400/20 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${option.color}-400`} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{option.title}</h4>
                      <p className="text-sm text-gray-400">{option.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Smart Questionnaire</h2>
          <p className="text-xl text-gray-300">Help us understand your goals and preferences</p>
        </div>
        
        <Card className="glass-card p-8">
          <CardContent className="space-y-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm text-green-400 font-medium">AI Powered</span>
              </div>
              <Progress value={progress} className="h-2">
                <div 
                  className="progress-bar h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </Progress>
            </div>
            
            {/* Question */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-4">{question.title}</h3>
                <p className="text-gray-400 mb-6">{question.subtitle}</p>
              </div>
              
              {renderQuestionContent()}
              
              {/* AI Suggestion */}
              {currentQuestion === 2 && (
                <div className="chat-bubble p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">AI Suggestion</p>
                      <p className="text-sm text-gray-300">
                        Based on current trends, I'd recommend focusing on Tech Internships and Research Grants. 
                        These sectors show high growth and offer excellent career advancement opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="glass-card hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!answers[question.id]}
                className="ai-gradient hover:scale-105 transition-all duration-300"
              >
                {currentQuestion === questions.length - 1 ? "Complete" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
