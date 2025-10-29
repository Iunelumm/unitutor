import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // User's preferred roles: 'student', 'tutor', or 'both'
  preferredRoles: varchar("preferredRoles", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Profile table for students and tutors
 */
export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  userRole: mysqlEnum("userRole", ["student", "tutor"]).notNull(),
  age: int("age"),
  year: varchar("year", { length: 50 }),
  major: varchar("major", { length: 255 }),
  bio: text("bio"),
  priceMin: int("priceMin"),
  priceMax: int("priceMax"),
  courses: json("courses").$type<string[]>(),
  availability: json("availability").$type<AvailabilitySlot[]>(),
  creditPoints: int("creditPoints").default(0).notNull(),
  contactInfo: text("contactInfo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export interface AvailabilitySlot {
  weekIndex: number;
  dayOfWeek: number;
  hourBlock: string;
  isBookable: boolean;
}

/**
 * Sessions table
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => users.id),
  tutorId: int("tutorId").notNull().references(() => users.id),
  course: varchar("course", { length: 255 }).notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  status: mysqlEnum("status", [
    "PENDING",
    "CONFIRMED",
    "PENDING_RATING",
    "DISPUTED",
    "CLOSED",
    "CANCELLED"
  ]).default("PENDING").notNull(),
  studentCompleted: boolean("studentCompleted").default(false).notNull(),
  tutorCompleted: boolean("tutorCompleted").default(false).notNull(),
  studentRated: boolean("studentRated").default(false).notNull(),
  tutorRated: boolean("tutorRated").default(false).notNull(),
  cancelled: boolean("cancelled").default(false).notNull(),
  cancelledBy: int("cancelledBy"),
  cancelReason: text("cancelReason"),
  cancellationRated: boolean("cancellationRated").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Ratings table
 */
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => sessions.id),
  raterId: int("raterId").notNull().references(() => users.id),
  targetId: int("targetId").notNull().references(() => users.id),
  score: int("score").notNull(),
  comment: text("comment"),
  visibility: mysqlEnum("visibility", ["public", "private"]).default("public").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * Support tickets table
 */
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  category: mysqlEnum("category", [
    "account",
    "matching",
    "cancellation",
    "ratings",
    "rules",
    "technical"
  ]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "resolved"]).default("pending").notNull(),
  adminResponse: text("adminResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

/**
 * Chat messages table
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => sessions.id),
  senderId: int("senderId").notNull().references(() => users.id),
  message: text("message").notNull(),
  sanitized: boolean("sanitized").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

