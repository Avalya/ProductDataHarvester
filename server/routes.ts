import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertUserSchema, insertOpportunitySchema, insertUserMatchSchema, registerUserSchema, loginUserSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "demo-key"
});

// Session configuration
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "ai-career-navigator-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Extend session type
declare module "express-session" {
  interface SessionData {
    userId: number;
    userEmail: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(getSession());
  
  // Registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      // Create user
      const user = await storage.createUser({
        email: userData.email,
        name: userData.name,
        country: userData.country,
        passwordHash,
        skills: [],
        interests: [],
        goals: [],
      });
      
      // Set session
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      
      // Return user without password
      const { passwordHash: _, ...userResponse } = user;
      res.json({ user: userResponse, message: "Registration successful" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      
      // Return user without password
      const { passwordHash: _, ...userResponse } = user;
      res.json({ user: userResponse, message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  
  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });
  
  // Get current user endpoint
  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { passwordHash: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Seed database with sample opportunities
  app.post("/api/seed-opportunities", async (req, res) => {
    try {
      const sampleOpportunities = [
        {
          title: "Google Summer of Code - Software Engineering Internship",
          organization: "Google",
          type: "Internship",
          location: "Mountain View, CA",
          duration: "12 weeks",
          salary: "$7,500/month",
          deadline: "2025-03-15",
          status: "Open",
          description: "Work on real-world open source projects with Google mentors. Develop software solutions that impact millions of users worldwide.",
          requirements: ["Computer Science or related field", "Proficiency in Python, Java, or C++", "Open source contributions", "Strong problem-solving skills"],
          tags: ["Software Engineering", "Open Source", "Programming", "Tech"],
          url: "https://summerofcode.withgoogle.com/",
          isRemote: false
        },
        {
          title: "Microsoft Azure Cloud Engineering Fellowship",
          organization: "Microsoft",
          type: "Fellowship",
          location: "Seattle, WA",
          duration: "6 months",
          salary: "$8,000/month",
          deadline: "2025-02-28",
          status: "Open",
          description: "Build next-generation cloud infrastructure and services on Microsoft Azure platform. Work with cutting-edge technologies in distributed systems.",
          requirements: ["Bachelor's in Computer Science", "Cloud computing knowledge", "Azure certifications preferred", "Distributed systems experience"],
          tags: ["Cloud Computing", "Azure", "Infrastructure", "Distributed Systems"],
          url: "https://careers.microsoft.com/",
          isRemote: true
        },
        {
          title: "United Nations Global Youth Leadership Program",
          organization: "United Nations",
          type: "Fellowship",
          location: "New York, NY",
          duration: "12 months",
          salary: "$4,500/month",
          deadline: "2025-04-01",
          status: "Open",
          description: "Lead global initiatives for sustainable development and peace. Work directly with UN officials on international policy and humanitarian projects.",
          requirements: ["Master's degree in International Relations, Political Science, or related field", "Multilingual capabilities", "International experience", "Leadership experience"],
          tags: ["International Relations", "Policy", "Leadership", "Humanitarian"],
          url: "https://careers.un.org/",
          isRemote: false
        },
        {
          title: "Rhodes Scholarship - Oxford University",
          organization: "Rhodes Trust",
          type: "Scholarship",
          location: "Oxford, UK",
          duration: "2-3 years",
          salary: "Full funding + stipend",
          deadline: "2025-07-01",
          status: "Open",
          description: "The world's oldest international scholarship program. Study at Oxford University with full funding and join a network of global leaders.",
          requirements: ["Exceptional academic achievement", "Leadership potential", "Commitment to service", "Age 18-24"],
          tags: ["Education", "Leadership", "Oxford", "Academic Excellence"],
          url: "https://www.rhodeshouse.ox.ac.uk/",
          isRemote: false
        },
        {
          title: "SpaceX Starship Engineering Internship",
          organization: "SpaceX",
          type: "Internship",
          location: "Hawthorne, CA",
          duration: "16 weeks",
          salary: "$9,000/month",
          deadline: "2025-01-31",
          status: "Open",
          description: "Design and build the next generation of spacecraft. Work on Starship development with world-class engineers pushing the boundaries of space exploration.",
          requirements: ["Aerospace, Mechanical, or Electrical Engineering", "CAD software proficiency", "Strong analytical skills", "Passion for space exploration"],
          tags: ["Aerospace", "Engineering", "Space", "Innovation"],
          url: "https://www.spacex.com/careers/",
          isRemote: false
        },
        {
          title: "McKinsey & Company Business Analyst Program",
          organization: "McKinsey & Company",
          type: "Internship",
          location: "Various Global Offices",
          duration: "10 weeks",
          salary: "$6,500/week",
          deadline: "2025-02-15",
          status: "Open",
          description: "Solve complex business problems for Fortune 500 companies. Gain exposure to multiple industries and develop strategic consulting skills.",
          requirements: ["Top-tier university degree", "Strong analytical and quantitative skills", "Leadership experience", "Excellent communication skills"],
          tags: ["Consulting", "Strategy", "Business", "Analytics"],
          url: "https://www.mckinsey.com/careers/",
          isRemote: false
        },
        {
          title: "Fulbright Research Grant - Global Health",
          organization: "Fulbright Program",
          type: "Grant",
          location: "Various Countries",
          duration: "12 months",
          salary: "$2,000-4,000/month",
          deadline: "2025-05-15",
          status: "Open",
          description: "Conduct independent research on global health challenges in developing countries. Collaborate with local institutions and contribute to public health solutions.",
          requirements: ["Graduate degree in Public Health, Medicine, or related field", "Research experience", "Cultural adaptability", "Language skills preferred"],
          tags: ["Global Health", "Research", "International", "Public Health"],
          url: "https://fulbrightprogram.org/",
          isRemote: false
        },
        {
          title: "Goldman Sachs Technology Analyst Program",
          organization: "Goldman Sachs",
          type: "Internship",
          location: "New York, NY",
          duration: "10 weeks",
          salary: "$8,500/month",
          deadline: "2025-01-15",
          status: "Open",
          description: "Build cutting-edge financial technology systems. Work on high-frequency trading platforms, risk management systems, and client-facing applications.",
          requirements: ["Computer Science or Engineering degree", "Strong programming skills in Java/C++/Python", "Interest in financial markets", "Quantitative background"],
          tags: ["FinTech", "Programming", "Finance", "Quantitative"],
          url: "https://www.goldmansachs.com/careers/",
          isRemote: false
        },
        {
          title: "CERN Particle Physics Research Fellowship",
          organization: "CERN",
          type: "Fellowship",
          location: "Geneva, Switzerland",
          duration: "24 months",
          salary: "CHF 5,000/month",
          deadline: "2025-03-31",
          status: "Open",
          description: "Conduct groundbreaking research in particle physics using the Large Hadron Collider. Contribute to fundamental discoveries about the universe.",
          requirements: ["PhD in Physics or related field", "Experience with particle physics", "Programming skills (C++, Python)", "Strong mathematical background"],
          tags: ["Physics", "Research", "CERN", "Particle Physics"],
          url: "https://careers.cern/",
          isRemote: false
        },
        {
          title: "Tesla Autopilot AI Engineering Internship",
          organization: "Tesla",
          type: "Internship",
          location: "Palo Alto, CA",
          duration: "12 weeks",
          salary: "$8,000/month",
          deadline: "2025-02-01",
          status: "Open",
          description: "Develop autonomous driving technology using deep learning and computer vision. Work on neural networks that power Tesla's Full Self-Driving capability.",
          requirements: ["Machine Learning or Computer Vision background", "Python and PyTorch experience", "Strong mathematics skills", "Autonomous systems interest"],
          tags: ["AI", "Machine Learning", "Autonomous Driving", "Computer Vision"],
          url: "https://www.tesla.com/careers/",
          isRemote: false
        }
      ];

      // Insert opportunities into database
      for (const opportunityData of sampleOpportunities) {
        await storage.createOpportunity(opportunityData);
      }

      res.json({ 
        message: "Sample opportunities seeded successfully", 
        count: sampleOpportunities.length 
      });
    } catch (error) {
      console.error("Seed opportunities error:", error);
      res.status(500).json({ message: "Failed to seed opportunities" });
    }
  });
  
  // AI CV Analysis endpoint
  app.post("/api/analyze-cv", async (req, res) => {
    try {
      const { cvText, userProfile } = req.body;
      
      if (!cvText) {
        return res.status(400).json({ message: "CV text is required" });
      }

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI career advisor that analyzes CVs and extracts key information. Respond with JSON containing skills, experience level, interests, and recommended opportunity types."
          },
          {
            role: "user",
            content: `Analyze this CV and extract key information:\n\n${cvText}\n\nProvide analysis in JSON format with: skills (array), experienceLevel (string), interests (array), recommendedTypes (array of opportunity types)`
          }
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      
      res.json({
        analysis,
        message: "CV analyzed successfully"
      });
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ 
        message: "Failed to analyze CV. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get AI-powered opportunity matches
  app.post("/api/get-matches", async (req, res) => {
    try {
      const { userId, userProfile } = req.body;
      
      if (!userId && !userProfile) {
        return res.status(400).json({ message: "User ID or profile is required" });
      }

      const opportunities = await storage.getAllOpportunities();
      
      // Get user profile
      let user = null;
      if (userId) {
        user = await storage.getUser(userId);
      }

      const profileToUse = user || userProfile;
      
      if (!profileToUse) {
        return res.status(404).json({ message: "User profile not found" });
      }

      // Use AI to calculate match scores
      const prompt = `
        User Profile:
        - Skills: ${profileToUse.skills?.join(", ") || "Not specified"}
        - Interests: ${profileToUse.interests?.join(", ") || "Not specified"}
        - Goals: ${profileToUse.goals?.join(", ") || "Not specified"}
        - Education: ${profileToUse.education || "Not specified"}
        
        Opportunities: ${JSON.stringify(opportunities.map(opp => ({
          id: opp.id,
          title: opp.title,
          type: opp.type,
          requirements: opp.requirements,
          tags: opp.tags
        })))}
        
        Calculate match percentages (0-100) for each opportunity based on skills alignment, interests, and goals.
        Return JSON with array of {opportunityId, matchPercentage, reasons}.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI career matching system. Calculate precise match percentages based on user profiles and opportunity requirements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const matchingResults = JSON.parse(response.choices[0].message.content || '{"matches": []}');
      const matches = matchingResults.matches || [];

      // Store matches if user exists
      if (userId) {
        for (const match of matches) {
          await storage.createUserMatch({
            userId,
            opportunityId: match.opportunityId,
            matchPercentage: match.matchPercentage,
            reasons: match.reasons || [],
            isSaved: false
          });
        }
      }

      // Combine opportunities with match data
      const opportunitiesWithMatches = opportunities.map(opp => {
        const match = matches.find((m: any) => m.opportunityId === opp.id);
        return {
          ...opp,
          matchPercentage: match?.matchPercentage || 0,
          matchReasons: match?.reasons || []
        };
      }).sort((a, b) => b.matchPercentage - a.matchPercentage);

      res.json({
        opportunities: opportunitiesWithMatches,
        totalMatches: opportunities.length,
        highMatches: opportunitiesWithMatches.filter(opp => opp.matchPercentage >= 80).length
      });
    } catch (error) {
      console.error("Matching error:", error);
      res.status(500).json({ 
        message: "Failed to calculate matches. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const systemPrompt = "You are a helpful AI career advisor. Provide personalized advice about internships, study abroad programs, grants, and career opportunities. Keep responses concise and actionable.";
      
      const contextPrompt = context ? `\n\nUser Context: ${JSON.stringify(context)}` : "";

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt + contextPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500,
      });

      res.json({
        response: response.choices[0].message.content,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        message: "Failed to process chat message. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // User management endpoints
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(parseInt(req.params.id), updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user", error });
    }
  });

  // Opportunity endpoints
  app.get("/api/opportunities", async (req, res) => {
    const opportunities = await storage.getAllOpportunities();
    res.json(opportunities);
  });

  app.get("/api/opportunities/:id", async (req, res) => {
    const opportunity = await storage.getOpportunityById(parseInt(req.params.id));
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    res.json(opportunity);
  });

  // User matches endpoints
  app.get("/api/users/:id/matches", async (req, res) => {
    const matches = await storage.getUserMatches(parseInt(req.params.id));
    res.json(matches);
  });

  app.put("/api/matches/:id/save", async (req, res) => {
    const { isSaved } = req.body;
    const match = await storage.updateUserMatch(parseInt(req.params.id), { isSaved });
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.json(match);
  });

  const httpServer = createServer(app);
  return httpServer;
}
