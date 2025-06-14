import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertOpportunitySchema, insertUserMatchSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "demo-key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
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
