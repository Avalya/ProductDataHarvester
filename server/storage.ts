import { users, opportunities, userMatches, type User, type InsertUser, type Opportunity, type InsertOpportunity, type UserMatch, type InsertUserMatch } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Opportunity operations
  getAllOpportunities(): Promise<Opportunity[]>;
  getOpportunityById(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;

  // User match operations
  getUserMatches(userId: number): Promise<UserMatch[]>;
  createUserMatch(match: InsertUserMatch): Promise<UserMatch>;
  updateUserMatch(id: number, updates: Partial<InsertUserMatch>): Promise<UserMatch | undefined>;
  deleteUserMatch(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private opportunities: Map<number, Opportunity>;
  private userMatches: Map<number, UserMatch>;
  private currentUserId: number;
  private currentOpportunityId: number;
  private currentMatchId: number;

  constructor() {
    this.users = new Map();
    this.opportunities = new Map();
    this.userMatches = new Map();
    this.currentUserId = 1;
    this.currentOpportunityId = 1;
    this.currentMatchId = 1;
    
    // Initialize with demo opportunities
    this.initializeOpportunities();
  }

  private initializeOpportunities() {
    const demoOpportunities: InsertOpportunity[] = [
      {
        title: "Software Engineering Internship",
        organization: "Google",
        type: "internship",
        location: "Mountain View, CA",
        duration: "3 months",
        salary: "$8,000/month",
        deadline: "Deadline passed",
        status: "deadline-passed",
        description: "Work on cutting-edge technology projects with experienced engineers. Contribute to products used by billions of users worldwide.",
        requirements: ["JavaScript", "Python", "Computer Science"],
        tags: ["tech", "software", "internship"],
        url: "https://careers.google.com",
        isRemote: false,
      },
      {
        title: "Remote Data Science Fellowship",
        organization: "Microsoft",
        type: "fellowship",
        location: "Remote",
        duration: "6 months",
        salary: "$6,000/month",
        deadline: "Deadline passed",
        status: "deadline-passed",
        description: "Work on AI/ML projects with Microsoft Research team. Focus on responsible AI and social impact applications.",
        requirements: ["Python", "Machine Learning", "Data Science"],
        tags: ["data-science", "ai", "remote"],
        url: "https://careers.microsoft.com",
        isRemote: true,
      },
      {
        title: "Erasmus+ Study Abroad Program",
        organization: "European Union",
        type: "study-abroad",
        location: "Various EU Countries",
        duration: "1-2 semesters",
        salary: "",
        deadline: "Deadline passed",
        status: "deadline-passed",
        description: "Study at top European universities while experiencing different cultures. Full academic credit transfer guaranteed.",
        requirements: ["Academic Excellence", "Language Skills"],
        tags: ["europe", "study-abroad", "education"],
        url: "https://erasmus-plus.ec.europa.eu",
        isRemote: false,
      },
      {
        title: "UN Sustainable Development Internship",
        organization: "United Nations",
        type: "internship",
        location: "New York, NY",
        duration: "6 months",
        salary: "",
        deadline: "Open",
        status: "open",
        description: "Contribute to global sustainability initiatives. Work with international teams on climate change and development projects.",
        requirements: ["International Relations", "Environmental Science"],
        tags: ["sustainability", "international", "policy"],
        url: "https://careers.un.org",
        isRemote: false,
      },
      {
        title: "Fulbright Research Grant",
        organization: "Fulbright Commission",
        type: "grant",
        location: "Global",
        duration: "9-12 months",
        salary: "",
        deadline: "Open",
        status: "open",
        description: "Conduct independent research abroad. Full funding for living expenses, travel, and research costs included.",
        requirements: ["Research Experience", "Academic Excellence"],
        tags: ["research", "grant", "global"],
        url: "https://fulbrightscholars.org",
        isRemote: false,
      },
      {
        title: "Singapore Exchange Program",
        organization: "National University of Singapore",
        type: "study-abroad",
        location: "Singapore",
        duration: "1 semester",
        salary: "",
        deadline: "Open",
        status: "open",
        description: "Experience Asian culture while studying at one of the world's top universities. Focus on technology and innovation.",
        requirements: ["Academic Standing", "English Proficiency"],
        tags: ["singapore", "technology", "asia"],
        url: "https://nus.edu.sg",
        isRemote: false,
      },
    ];

    demoOpportunities.forEach(opp => this.createOpportunity(opp));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      skills: insertUser.skills || [],
      interests: insertUser.interests || [],
      goals: insertUser.goals || [],
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllOpportunities(): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values());
  }

  async getOpportunityById(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.currentOpportunityId++;
    const opportunity: Opportunity = { 
      ...insertOpportunity, 
      id,
      requirements: insertOpportunity.requirements || [],
      tags: insertOpportunity.tags || [],
    };
    this.opportunities.set(id, opportunity);
    return opportunity;
  }

  async getUserMatches(userId: number): Promise<UserMatch[]> {
    return Array.from(this.userMatches.values()).filter(match => match.userId === userId);
  }

  async createUserMatch(insertMatch: InsertUserMatch): Promise<UserMatch> {
    const id = this.currentMatchId++;
    const match: UserMatch = { 
      ...insertMatch, 
      id, 
      createdAt: new Date(),
      reasons: insertMatch.reasons || [],
    };
    this.userMatches.set(id, match);
    return match;
  }

  async updateUserMatch(id: number, updates: Partial<InsertUserMatch>): Promise<UserMatch | undefined> {
    const match = this.userMatches.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, ...updates };
    this.userMatches.set(id, updatedMatch);
    return updatedMatch;
  }

  async deleteUserMatch(id: number): Promise<boolean> {
    return this.userMatches.delete(id);
  }
}

export const storage = new MemStorage();
