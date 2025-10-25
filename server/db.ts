import { and, eq, or, desc, sql, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  profiles, 
  InsertProfile,
  sessions,
  InsertSession,
  ratings,
  InsertRating,
  tickets,
  InsertTicket,
  chatMessages,
  InsertChatMessage,
  Profile,
  Session,
  Rating,
  Ticket
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Profile functions
export async function getProfile(userId: number, userRole: "student" | "tutor") {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profiles)
    .where(and(eq(profiles.userId, userId), eq(profiles.userRole, userRole)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertProfile(profile: InsertProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getProfile(profile.userId, profile.userRole);
  
  if (existing) {
    await db.update(profiles)
      .set({
        age: profile.age,
        year: profile.year,
        major: profile.major,
        bio: profile.bio,
        priceMin: profile.priceMin,
        priceMax: profile.priceMax,
        courses: profile.courses,
        availability: profile.availability,
        contactInfo: profile.contactInfo,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(profiles).values(profile);
    return Number(result[0].insertId);
  }
}

export async function getTutorProfiles(courseFilter?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(profiles).where(eq(profiles.userRole, "tutor"));
  const results = await query;
  
  if (courseFilter) {
    return results.filter(p => {
      const courses = p.courses as string[] || [];
      return courses.some(c => c.toLowerCase().includes(courseFilter.toLowerCase()));
    });
  }
  
  return results;
}

// Session functions
export async function createSession(session: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sessions).values(session);
  return Number(result[0].insertId);
}

export async function getSession(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(sessions)
    .where(or(eq(sessions.studentId, userId), eq(sessions.tutorId, userId)))
    .orderBy(desc(sessions.createdAt));
  return result;
}

export async function updateSession(id: number, updates: Partial<Session>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessions).set({ ...updates, updatedAt: new Date() }).where(eq(sessions.id, id));
}

export async function getAllSessions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sessions).orderBy(desc(sessions.createdAt));
}

export async function getDisputedSessions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sessions).where(eq(sessions.status, "DISPUTED"));
}

// Rating functions
export async function createRating(rating: InsertRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ratings).values(rating);
  return Number(result[0].insertId);
}

export async function getRatingsForUser(targetId: number, visibility?: "public" | "private") {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(ratings).where(eq(ratings.targetId, targetId));
  const results = await query;
  
  if (visibility) {
    return results.filter(r => r.visibility === visibility);
  }
  
  return results;
}

export async function getSessionRating(sessionId: number, raterId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ratings)
    .where(and(eq(ratings.sessionId, sessionId), eq(ratings.raterId, raterId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTutorAverageRating(tutorId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({
    avg: sql<number>`AVG(${ratings.score})`
  }).from(ratings).where(eq(ratings.targetId, tutorId));
  
  return result[0]?.avg || 0;
}

// Ticket functions
export async function createTicket(ticket: InsertTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tickets).values(ticket);
  return Number(result[0].insertId);
}

export async function getUserTickets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tickets)
    .where(eq(tickets.userId, userId))
    .orderBy(desc(tickets.createdAt));
}

export async function getAllTickets() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
}

export async function updateTicket(id: number, updates: Partial<Ticket>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tickets).set({ ...updates, updatedAt: new Date() }).where(eq(tickets.id, id));
}

// Chat functions
export async function createChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chatMessages).values(message);
  return Number(result[0].insertId);
}

export async function getSessionMessages(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);
}

// Analytics functions
export async function getCompletedSessionCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` })
    .from(sessions)
    .where(eq(sessions.status, "CLOSED"));
  return result[0]?.count || 0;
}

export async function getDisputeCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` })
    .from(sessions)
    .where(eq(sessions.status, "DISPUTED"));
  return result[0]?.count || 0;
}

export async function getPendingRatingCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` })
    .from(sessions)
    .where(eq(sessions.status, "PENDING_RATING"));
  return result[0]?.count || 0;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function searchUsers(query: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users)
    .where(
      or(
        like(users.name, `%${query}%`),
        like(users.email, `%${query}%`)
      )
    );
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const userSessions = await db.select().from(sessions)
    .where(or(eq(sessions.studentId, userId), eq(sessions.tutorId, userId)));
  
  const userRatings = await db.select().from(ratings)
    .where(eq(ratings.targetId, userId));
  
  const avgRating = userRatings.length > 0
    ? userRatings.reduce((sum, r) => sum + r.score, 0) / userRatings.length
    : 0;
  
  return {
    totalSessions: userSessions.length,
    completedSessions: userSessions.filter(s => s.status === 'CLOSED').length,
    disputedSessions: userSessions.filter(s => s.status === 'DISPUTED').length,
    cancelledSessions: userSessions.filter(s => s.cancelled).length,
    averageRating: avgRating,
    totalRatings: userRatings.length,
  };
}

export async function getTotalUserCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  return result[0]?.count || 0;
}

export async function getStudentCount() {
  const db = await getDb();
  if (!db) return 0;
  const studentProfiles = await db.select().from(profiles);
  return studentProfiles.filter(p => p.userRole === 'student').length;
}

export async function getTutorCount() {
  const db = await getDb();
  if (!db) return 0;
  const tutorProfiles = await db.select().from(profiles);
  return tutorProfiles.filter(p => p.userRole === 'tutor').length;
}

