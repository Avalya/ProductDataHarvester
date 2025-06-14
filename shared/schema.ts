import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  country: text("country"),
  education: text("education"),
  cvText: text("cv_text"),
  skills: jsonb("skills").$type<string[]>().default([]),
  interests: jsonb("interests").$type<string[]>().default([]),
  goals: jsonb("goals").$type<string[]>().default([]),
  isEmailVerified: boolean("is_email_verified").default(false),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  updatedAt: true,
});

export const registerUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  country: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
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
