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
  sessionFiles,
  InsertSessionFile,
  sessionNotes,
  InsertSessionNote,
  favoriteTutors,
  InsertFavoriteTutor,
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


// ===== Session Files Functions =====

export async function createSessionFile(file: InsertSessionFile) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.insert(sessionFiles).values(file);
  return result;
}

export async function getSessionFiles(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const files = await db
    .select()
    .from(sessionFiles)
    .where(eq(sessionFiles.sessionId, sessionId))
    .orderBy(desc(sessionFiles.createdAt));
  
  return files;
}

export async function getSessionFile(fileId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const files = await db
    .select()
    .from(sessionFiles)
    .where(eq(sessionFiles.id, fileId))
    .limit(1);
  
  return files[0] || null;
}

export async function getUserFiles(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all sessions where user is student or tutor
  const userSessions = await db
    .select()
    .from(sessions)
    .where(or(
      eq(sessions.studentId, userId),
      eq(sessions.tutorId, userId)
    ));
  
  const sessionIds = userSessions.map(s => s.id);
  
  if (sessionIds.length === 0) return [];
  
  // Get all files for those sessions
  const files = await db
    .select({
      id: sessionFiles.id,
      sessionId: sessionFiles.sessionId,
      uploaderId: sessionFiles.uploaderId,
      fileName: sessionFiles.fileName,
      fileUrl: sessionFiles.fileUrl,
      fileSize: sessionFiles.fileSize,
      fileType: sessionFiles.fileType,
      description: sessionFiles.description,
      createdAt: sessionFiles.createdAt,
      course: sessions.course,
      startTime: sessions.startTime,
    })
    .from(sessionFiles)
    .leftJoin(sessions, eq(sessionFiles.sessionId, sessions.id))
    .where(sql`${sessionFiles.sessionId} IN (${sql.join(sessionIds.map(id => sql`${id}`), sql`, `)})`)
    .orderBy(desc(sessionFiles.createdAt));
  
  return files;
}

export async function deleteSessionFile(fileId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  await db.delete(sessionFiles).where(eq(sessionFiles.id, fileId));
  return { success: true };
}

// ===== Session Notes Functions =====

export async function upsertSessionNote(note: InsertSessionNote) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  // Check if note already exists for this session and author
  const existing = await db
    .select()
    .from(sessionNotes)
    .where(and(
      eq(sessionNotes.sessionId, note.sessionId),
      eq(sessionNotes.authorId, note.authorId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing note
    await db
      .update(sessionNotes)
      .set({ content: note.content, updatedAt: new Date() })
      .where(eq(sessionNotes.id, existing[0].id));
    return { ...existing[0], content: note.content };
  } else {
    // Create new note
    await db.insert(sessionNotes).values(note);
    return note;
  }
}

export async function getSessionNotes(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const notes = await db
    .select({
      id: sessionNotes.id,
      sessionId: sessionNotes.sessionId,
      authorId: sessionNotes.authorId,
      authorRole: sessionNotes.authorRole,
      content: sessionNotes.content,
      createdAt: sessionNotes.createdAt,
      updatedAt: sessionNotes.updatedAt,
      authorName: users.name,
    })
    .from(sessionNotes)
    .leftJoin(users, eq(sessionNotes.authorId, users.id))
    .where(eq(sessionNotes.sessionId, sessionId))
    .orderBy(sessionNotes.createdAt);
  
  return notes;
}

// ===== Favorite Tutors Functions =====

export async function addFavoriteTutor(favorite: InsertFavoriteTutor) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  try {
    await db.insert(favoriteTutors).values(favorite);
    return { success: true };
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 'ER_DUP_ENTRY') {
      // Update notes if already exists
      await db
        .update(favoriteTutors)
        .set({ notes: favorite.notes })
        .where(and(
          eq(favoriteTutors.studentId, favorite.studentId),
          eq(favoriteTutors.tutorId, favorite.tutorId)
        ));
      return { success: true };
    }
    throw error;
  }
}

export async function removeFavoriteTutor(studentId: number, tutorId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  await db
    .delete(favoriteTutors)
    .where(and(
      eq(favoriteTutors.studentId, studentId),
      eq(favoriteTutors.tutorId, tutorId)
    ));
  
  return { success: true };
}

export async function getFavoriteTutors(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const favorites = await db
    .select({
      id: favoriteTutors.id,
      tutorId: favoriteTutors.tutorId,
      notes: favoriteTutors.notes,
      createdAt: favoriteTutors.createdAt,
      tutorName: users.name,
      tutorEmail: users.email,
      tutorProfile: profiles,
    })
    .from(favoriteTutors)
    .leftJoin(users, eq(favoriteTutors.tutorId, users.id))
    .leftJoin(profiles, and(
      eq(profiles.userId, favoriteTutors.tutorId),
      eq(profiles.userRole, 'tutor')
    ))
    .where(eq(favoriteTutors.studentId, studentId))
    .orderBy(desc(favoriteTutors.createdAt));
  
  // Get session count and average rating for each tutor
  const tutorsWithStats = await Promise.all(
    favorites.map(async (fav) => {
      const sessionCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(sessions)
        .where(and(
          eq(sessions.tutorId, fav.tutorId),
          eq(sessions.studentId, studentId),
          or(
            eq(sessions.status, 'CLOSED'),
            eq(sessions.status, 'PENDING_RATING')
          )
        ));
      
      const avgRating = await db
        .select({ avg: sql<number>`avg(${ratings.score})` })
        .from(ratings)
        .where(eq(ratings.targetId, fav.tutorId));
      
      return {
        ...fav,
        sessionCount: sessionCount[0]?.count || 0,
        averageRating: avgRating[0]?.avg || 0,
      };
    })
  );
  
  return tutorsWithStats;
}

export async function isFavoriteTutor(studentId: number, tutorId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const favorite = await db
    .select()
    .from(favoriteTutors)
    .where(and(
      eq(favoriteTutors.studentId, studentId),
      eq(favoriteTutors.tutorId, tutorId)
    ))
    .limit(1);
  
  return favorite[0] || null;
}
