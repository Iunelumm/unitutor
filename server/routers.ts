import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { AvailabilitySlot } from "../drizzle/schema";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Helper function to sanitize chat messages
function sanitizeMessage(message: string): { sanitized: string; containsContact: boolean } {
  const patterns = [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
    /\b(wechat|WeChat|微信)[\s:]*[A-Za-z0-9_-]+/gi, // WeChat IDs
    /(https?:\/\/[^\s]+)/g, // URLs
    /\b(whatsapp|telegram|line|kakao)[\s:]*[A-Za-z0-9_-]+/gi, // Other messaging apps
  ];
  
  let sanitized = message;
  let containsContact = false;
  
  for (const pattern of patterns) {
    if (pattern.test(message)) {
      containsContact = true;
      sanitized = sanitized.replace(
        pattern,
        "[Please complete your first session on-platform before sharing contact details]"
      );
    }
  }
  
  return { sanitized, containsContact };
}

// Helper to check if time is within 4 hours
function isWithinFourHours(targetTime: Date): boolean {
  const now = new Date();
  const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  return targetTime < fourHoursFromNow;
}

// Helper to check if time is within 12 hours
function isWithinTwelveHours(targetTime: Date): boolean {
  const now = new Date();
  const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  return targetTime < twelveHoursFromNow;
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  user: router({
    updatePreferredRoles: protectedProcedure
      .input(z.object({
        preferredRoles: z.enum(["student", "tutor", "both"])
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUser({
          openId: ctx.user.openId,
          preferredRoles: input.preferredRoles,
        });
        return { success: true };
      }),
  }),

  profile: router({
    get: protectedProcedure
      .input(z.object({ role: z.enum(["student", "tutor"]) }))
      .query(async ({ ctx, input }) => {
        const profile = await db.getProfile(ctx.user.id, input.role);
        return profile || null;
      }),

    save: protectedProcedure
      .input(z.object({
        role: z.enum(["student", "tutor"]),
        age: z.number().optional(),
        year: z.string().optional(),
        major: z.string().optional(),
        bio: z.string().optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        courses: z.array(z.string()).optional(),
        availability: z.array(z.object({
          weekIndex: z.number(),
          dayOfWeek: z.number(),
          hourBlock: z.string(),
          isBookable: z.boolean(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { role, ...profileData } = input;
        
        // Validation for required fields
        if (role === "tutor") {
          if (!profileData.age || !profileData.year || !profileData.major || 
              !profileData.priceMin || !profileData.priceMax || 
              !profileData.courses || !profileData.availability || !profileData.bio) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'All fields are required for tutor profile'
            });
          }
        } else {
          // Student - bio is optional
          if (!profileData.age || !profileData.year || !profileData.major || 
              !profileData.priceMin || !profileData.priceMax || 
              !profileData.courses || !profileData.availability) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Please complete all required fields'
            });
          }
        }
        
        await db.upsertProfile({
          userId: ctx.user.id,
          userRole: role,
          ...profileData,
        });
        
        return { success: true };
      }),

    updateAvailability: protectedProcedure
      .input(z.object({
        role: z.enum(["student", "tutor"]),
        availability: z.array(z.object({
          weekIndex: z.number(),
          dayOfWeek: z.number(),
          hourBlock: z.string(),
          isBookable: z.boolean(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfile(ctx.user.id, input.role);
        if (!profile) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
        }
        
        await db.upsertProfile({
          userId: ctx.user.id,
          userRole: input.role,
          availability: input.availability,
        });
        
        return { success: true };
      }),
  }),

  tutors: router({
    search: protectedProcedure
      .input(z.object({
        course: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const tutorProfiles = await db.getTutorProfiles(input.course);
        
        // Get user info and ratings for each tutor
        const tutorsWithDetails = await Promise.all(
          tutorProfiles.map(async (profile) => {
            const user = await db.getUserById(profile.userId);
            const avgRating = await db.getTutorAverageRating(profile.userId);
            const ratings = await db.getRatingsForUser(profile.userId, "public");
            
            return {
              ...profile,
              userName: user?.name || "Unknown",
              averageRating: avgRating,
              totalRatings: ratings.length,
            };
          })
        );
        
        return tutorsWithDetails;
      }),

    getProfile: protectedProcedure
      .input(z.object({ tutorId: z.number() }))
      .query(async ({ input }) => {
        const profile = await db.getProfile(input.tutorId, "tutor");
        if (!profile) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Tutor profile not found' });
        }
        
        const user = await db.getUserById(input.tutorId);
        const avgRating = await db.getTutorAverageRating(input.tutorId);
        const ratings = await db.getRatingsForUser(input.tutorId, "public");
        
        return {
          ...profile,
          userName: user?.name || "Unknown",
          averageRating: avgRating,
          ratings,
        };
      }),
  }),

  sessions: router({
    create: protectedProcedure
      .input(z.object({
        tutorId: z.number(),
        course: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const startTime = new Date(input.startTime);
        const endTime = new Date(input.endTime);
        
        // Validate 4-hour rule
        if (isWithinFourHours(startTime)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This time slot is within 4 hours. Please pick a later slot.'
          });
        }
        
        // Check for time slot conflicts with tutor's confirmed sessions
        const tutorSessions = await db.getUserSessions(input.tutorId);
        const confirmedSessions = tutorSessions.filter(s => 
          s.status === "CONFIRMED" || s.status === "PENDING"
        );
        
        const hasConflict = confirmedSessions.some(existing => {
          const existingStart = new Date(existing.startTime);
          const existingEnd = new Date(existing.endTime);
          
          // Check if time ranges overlap
          return (
            (startTime >= existingStart && startTime < existingEnd) ||
            (endTime > existingStart && endTime <= existingEnd) ||
            (startTime <= existingStart && endTime >= existingEnd)
          );
        });
        
        if (hasConflict) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This time slot is no longer available. The tutor has another session scheduled.'
          });
        }
        
        // Prevent self-booking
        if (ctx.user.id === input.tutorId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You cannot book a session with yourself.'
          });
        }
        
        const sessionId = await db.createSession({
          studentId: ctx.user.id,
          tutorId: input.tutorId,
          course: input.course,
          startTime,
          endTime,
          status: "PENDING",
        });
        
        return { sessionId, success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const sessions = await db.getUserSessions(ctx.user.id);
      
      // Enrich with user details
      const enrichedSessions = await Promise.all(
        sessions.map(async (session) => {
          const student = await db.getUserById(session.studentId);
          const tutor = await db.getUserById(session.tutorId);
          
          return {
            ...session,
            studentName: student?.name || "Unknown",
            tutorName: tutor?.name || "Unknown",
          };
        })
      );
      
      return enrichedSessions;
    }),

    get: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const session = await db.getSession(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        
        // Verify user is part of this session
        if (session.studentId !== ctx.user.id && session.tutorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        const student = await db.getUserById(session.studentId);
        const tutor = await db.getUserById(session.tutorId);
        
        return {
          ...session,
          studentName: student?.name || "Unknown",
          tutorName: tutor?.name || "Unknown",
        };
      }),

    confirm: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getSession(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        
        // Only tutor can confirm
        if (session.tutorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only tutor can confirm' });
        }
        
        if (session.status !== "PENDING") {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Session already processed' });
        }
        
        await db.updateSession(input.sessionId, { status: "CONFIRMED" });
        return { success: true };
      }),

    cancel: protectedProcedure
      .input(z.object({ 
        sessionId: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getSession(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        
        // Verify user is part of this session
        if (session.studentId !== ctx.user.id && session.tutorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        // Check 12-hour rule
        if (isWithinTwelveHours(session.startTime)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot cancel within 12 hours. Please coordinate with your partner directly.'
          });
        }
        
        await db.updateSession(input.sessionId, {
          status: "CANCELLED",
          cancelled: true,
          cancelledBy: ctx.user.id,
          cancelReason: input.reason || null,
        });
        
        return { success: true };
      }),

    markComplete: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getSession(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        
        const isStudent = session.studentId === ctx.user.id;
        const isTutor = session.tutorId === ctx.user.id;
        
        if (!isStudent && !isTutor) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        // Prevent marking complete before session start time
        const now = new Date();
        if (now < session.startTime) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot mark session as complete before it starts. This prevents fraudulent activity.'
          });
        }
        
        const updates: any = {};
        
        if (isStudent) {
          updates.studentCompleted = true;
        } else {
          updates.tutorCompleted = true;
        }
        
        // Check if both completed
        const bothCompleted = 
          (isStudent ? true : session.studentCompleted) && 
          (isTutor ? true : session.tutorCompleted);
        
        if (bothCompleted) {
          // Both parties confirmed completion - ready for rating
          updates.status = "PENDING_RATING";
        }
        // If only one party completed, keep status as CONFIRMED and wait for the other
        // Dispute detection will be handled by a separate check after session end time + grace period
        
        await db.updateSession(input.sessionId, updates);
        
        return { 
          success: true, 
          bothCompleted,
          disputed: updates.status === "DISPUTED",
        };
      }),
  }),

  ratings: router({
    submit: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        targetId: z.number(),
        score: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getSession(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        
        if (session.status !== "PENDING_RATING") {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Session not ready for rating' });
        }
        
        const isStudent = session.studentId === ctx.user.id;
        const isTutor = session.tutorId === ctx.user.id;
        
        if (!isStudent && !isTutor) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        // Prevent self-rating
        if (input.targetId === ctx.user.id) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot rate yourself.' });
        }
        
        // Check if already rated
        const existingRating = await db.getSessionRating(input.sessionId, ctx.user.id);
        if (existingRating) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already rated this session' });
        }
        
        // Determine visibility: student ratings are public, tutor ratings are private
        const visibility = isStudent ? "public" : "private";
        
        await db.createRating({
          sessionId: input.sessionId,
          raterId: ctx.user.id,
          targetId: input.targetId,
          score: input.score,
          comment: input.comment || null,
          visibility,
        });
        
        // Update session rating flags
        const updates: any = {};
        if (isStudent) {
          updates.studentRated = true;
        } else {
          updates.tutorRated = true;
        }
        
        // Check if both rated
        const bothRated = 
          (isStudent ? true : session.studentRated) && 
          (isTutor ? true : session.tutorRated);
        
        if (bothRated) {
          updates.status = "CLOSED";
          
          // Award credit points
          const studentProfile = await db.getProfile(session.studentId, "student");
          const tutorProfile = await db.getProfile(session.tutorId, "tutor");
          
          if (studentProfile) {
            await db.upsertProfile({
              userId: session.studentId,
              userRole: "student",
              creditPoints: (studentProfile.creditPoints || 0) + 10,
            });
          }
          
          if (tutorProfile) {
            await db.upsertProfile({
              userId: session.tutorId,
              userRole: "tutor",
              creditPoints: (tutorProfile.creditPoints || 0) + 10,
            });
          }
        }
        
        await db.updateSession(input.sessionId, updates);
        
        return { success: true, sessionClosed: bothRated };
      }),

    getForUser: protectedProcedure
      .input(z.object({ 
        userId: z.number(),
        visibility: z.enum(["public", "private"]).optional(),
      }))
      .query(async ({ input }) => {
        return await db.getRatingsForUser(input.userId, input.visibility);
      }),

    rateCancellation: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        score: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getSession(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        
        if (session.status !== "CANCELLED") {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Session is not cancelled' });
        }
        
        if (!session.cancelledBy) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'No cancellation to rate' });
        }
        
        // Only the non-cancelling party can rate the cancellation
        if (session.cancelledBy === ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot rate your own cancellation' });
        }
        
        if (session.studentId !== ctx.user.id && session.tutorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        if (session.cancellationRated) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cancellation already rated' });
        }
        
        // Create rating for the person who cancelled
        await db.createRating({
          sessionId: input.sessionId,
          raterId: ctx.user.id,
          targetId: session.cancelledBy,
          score: input.score,
          comment: input.comment || null,
          visibility: "public", // Cancellation ratings are always public
        });
        
        await db.updateSession(input.sessionId, {
          cancellationRated: true,
        });
        
        return { success: true };
      }),
  }),

  chat: router({
    send: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getSession(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        
        if (session.studentId !== ctx.user.id && session.tutorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        // Check if contact sharing is allowed (after first completed session)
        const userSessions = await db.getUserSessions(ctx.user.id);
        const completedSessions = userSessions.filter(s => s.status === "CLOSED");
        const hasCompletedSession = completedSessions.length > 0;
        
        const { sanitized, containsContact } = sanitizeMessage(input.message);
        
        // If trying to share contact before completing first session, use sanitized version
        const finalMessage = !hasCompletedSession && containsContact ? sanitized : input.message;
        
        await db.createChatMessage({
          sessionId: input.sessionId,
          senderId: ctx.user.id,
          message: finalMessage,
          sanitized: containsContact && !hasCompletedSession,
        });
        
        return { success: true, sanitized: containsContact && !hasCompletedSession };
      }),

    getMessages: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const session = await db.getSession(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        
        if (session.studentId !== ctx.user.id && session.tutorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        const messages = await db.getSessionMessages(input.sessionId);
        
        // Enrich with sender names
        const enriched = await Promise.all(
          messages.map(async (msg) => {
            const sender = await db.getUserById(msg.senderId);
            return {
              ...msg,
              senderName: sender?.name || "Unknown",
            };
          })
        );
        
        return enriched;
      }),
  }),

  tickets: router({
    create: protectedProcedure
      .input(z.object({
        category: z.enum(["account", "matching", "cancellation", "ratings", "rules", "technical"]),
        subject: z.string(),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const ticketId = await db.createTicket({
          userId: ctx.user.id,
          category: input.category,
          subject: input.subject,
          message: input.message,
          status: "pending",
        });
        
        return { ticketId, success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserTickets(ctx.user.id);
    }),
  }),

  admin: router({
    getTutorCount: publicProcedure.query(async () => {
      return await db.getTutorCount();
    }),

    sessions: adminProcedure.query(async () => {
      const sessions = await db.getAllSessions();
      
      const enriched = await Promise.all(
        sessions.map(async (session) => {
          const student = await db.getUserById(session.studentId);
          const tutor = await db.getUserById(session.tutorId);
          
          return {
            ...session,
            studentName: student?.name || "Unknown",
            tutorName: tutor?.name || "Unknown",
          };
        })
      );
      
      return enriched;
    }),

    disputes: adminProcedure.query(async () => {
      const sessions = await db.getDisputedSessions();
      
      const enriched = await Promise.all(
        sessions.map(async (session) => {
          const student = await db.getUserById(session.studentId);
          const tutor = await db.getUserById(session.tutorId);
          
          return {
            ...session,
            studentName: student?.name || "Unknown",
            tutorName: tutor?.name || "Unknown",
          };
        })
      );
      
      return enriched;
    }),

    tickets: adminProcedure.query(async () => {
      const tickets = await db.getAllTickets();
      
      const enriched = await Promise.all(
        tickets.map(async (ticket) => {
          const user = await db.getUserById(ticket.userId);
          return {
            ...ticket,
            userName: user?.name || "Unknown",
            userEmail: user?.email || "",
          };
        })
      );
      
      return enriched;
    }),

    updateTicket: adminProcedure
      .input(z.object({
        ticketId: z.number(),
        status: z.enum(["pending", "in_progress", "resolved"]),
        adminResponse: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateTicket(input.ticketId, {
          status: input.status,
          adminResponse: input.adminResponse || null,
        });
        
        return { success: true };
      }),

    analytics: adminProcedure.query(async () => {
      const completedSessions = await db.getCompletedSessionCount();
      const disputes = await db.getDisputeCount();
      const pendingRatings = await db.getPendingRatingCount();
      const totalUsers = await db.getTotalUserCount();
      const studentCount = await db.getStudentCount();
      const tutorCount = await db.getTutorCount();
      
      return {
        completedSessions,
        disputes,
        pendingRatings,
        totalUsers,
        studentCount,
        tutorCount,
      };
    }),

    users: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    searchUsers: adminProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchUsers(input.query);
      }),

    userDetail: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.userId);
        const studentProfile = await db.getProfile(input.userId, 'student');
        const tutorProfile = await db.getProfile(input.userId, 'tutor');
        const stats = await db.getUserStats(input.userId);
        
        return {
          user,
          studentProfile,
          tutorProfile,
          stats,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

