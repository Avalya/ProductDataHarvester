export interface UserProfile {
  id?: number;
  email: string;
  name: string;
  country?: string;
  education?: string;
  cvText?: string;
  skills: string[];
  interests: string[];
  goals: string[];
}

export interface OpportunityWithMatch {
  id: number;
  title: string;
  organization: string;
  type: string;
  location: string;
  duration?: string;
  salary?: string;
  deadline: string;
  status: string;
  description: string;
  requirements: string[];
  tags: string[];
  url?: string;
  isRemote: boolean;
  matchPercentage: number;
  matchReasons: string[];
}

export interface CVAnalysis {
  skills: string[];
  experienceLevel: string;
  interests: string[];
  recommendedTypes: string[];
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface UploadProgress {
  progress: number;
  status: string;
  isComplete: boolean;
}
