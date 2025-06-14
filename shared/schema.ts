import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  country: text("country"),
  education: text("education"),
  cvText: text("cv_text"),
  skills: jsonb("skills").$type<string[]>().default([]),
  interests: jsonb("interests").$type<string[]>().default([]),
  goals: jsonb("goals").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  type: text("type").notNull(), // internship, study-abroad, grant, fellowship
  location: text("location").notNull(),
  duration: text("duration"),
  salary: text("salary"),
  deadline: text("deadline"),
  status: text("status").notNull().default("open"), // open, closed, deadline-passed
  description: text("description").notNull(),
  requirements: jsonb("requirements").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  url: text("url"),
  isRemote: boolean("is_remote").default(false),
});

export const userMatches = pgTable("user_matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  opportunityId: integer("opportunity_id").references(() => opportunities.id),
  matchPercentage: integer("match_percentage").notNull(),
  reasons: jsonb("reasons").$type<string[]>().default([]),
  isSaved: boolean("is_saved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
});

export const insertUserMatchSchema = createInsertSchema(userMatches).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type UserMatch = typeof userMatches.$inferSelect;
export type InsertUserMatch = z.infer<typeof insertUserMatchSchema>;
