import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, real, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title"), // e.g., "Computer Science Student"
  bio: text("bio"),
  location: text("location"),
  experience: text("experience"), // "fresher", "0-2", "2-5", "5-10", "10+"
  education: jsonb("education").$type<{
    degree: string;
    field: string;
    institution: string;
    year: number;
  }[]>(),
  interests: text("interests").array(),
  skills: jsonb("skills").$type<{
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    verified: boolean;
  }[]>(),
  resumeUrl: text("resume_url"),
  resumeParsedData: jsonb("resume_parsed_data"),
  completionPercentage: integer("completion_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const careers = pgTable("careers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: jsonb("requirements").$type<string[]>(),
  skills: jsonb("skills").$type<{
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    category: "technical" | "soft" | "domain";
  }[]>(),
  salaryRange: jsonb("salary_range").$type<{
    min: number;
    max: number;
    currency: string;
  }>(),
  locations: text("locations").array(),
  industry: text("industry"),
  growthPath: jsonb("growth_path").$type<{
    level: string;
    title: string;
    salaryRange: { min: number; max: number };
    experience: string;
  }[]>(),
  embedding: jsonb("embedding").$type<number[]>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const careerMatches = pgTable("career_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  careerId: varchar("career_id").references(() => careers.id).notNull(),
  compatibilityScore: real("compatibility_score").notNull(),
  matchReasons: jsonb("match_reasons").$type<string[]>(),
  skillGaps: jsonb("skill_gaps").$type<{
    skill: string;
    currentLevel: string;
    requiredLevel: string;
  }[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roadmaps = pgTable("roadmaps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  careerId: varchar("career_id").references(() => careers.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  milestones: jsonb("milestones").$type<{
    id: string;
    title: string;
    description: string;
    skills: string[];
    estimatedTime: string;
    resources: {
      title: string;
      type: "course" | "article" | "project" | "certification";
      url: string;
      provider: string;
    }[];
    order: number;
  }[]>(),
  totalEstimatedTime: text("total_estimated_time"),
  difficulty: text("difficulty"), // "beginner", "intermediate", "advanced"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  roadmapId: varchar("roadmap_id").references(() => roadmaps.id).notNull(),
  milestoneId: text("milestone_id").notNull(),
  status: text("status").notNull(), // "not_started", "in_progress", "completed"
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const learningResources = pgTable("learning_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "course", "article", "project", "certification"
  url: text("url").notNull(),
  provider: text("provider").notNull(),
  rating: real("rating"),
  duration: text("duration"),
  difficulty: text("difficulty"),
  skills: text("skills").array(),
  isRecommended: boolean("is_recommended").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCareerSchema = createInsertSchema(careers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCareerMatchSchema = createInsertSchema(careerMatches).omit({
  id: true,
  createdAt: true,
});

export const insertRoadmapSchema = createInsertSchema(roadmaps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Career = typeof careers.$inferSelect;
export type InsertCareer = z.infer<typeof insertCareerSchema>;
export type CareerMatch = typeof careerMatches.$inferSelect;
export type InsertCareerMatch = z.infer<typeof insertCareerMatchSchema>;
export type Roadmap = typeof roadmaps.$inferSelect;
export type InsertRoadmap = z.infer<typeof insertRoadmapSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type LearningResource = typeof learningResources.$inferSelect;
