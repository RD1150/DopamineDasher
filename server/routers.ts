import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import Stripe from "stripe";
import { PRODUCTS } from "../shared/products.js";
import { sequenceTasks, calculateTotalDuration, validateSequence, getEncouragementMessage } from "./sequencing";
import type { UserState, TimeAvailable, Task } from "./sequencing";
import { decisionTreeRouter } from "./decisionTreeRouter";
import { pickAndWinRouter } from "./pickAndWinRouter";
import { feedbackRouter } from "./feedbackRouter";
import { retentionRouter } from "./retentionRouter";
import { coachRouter } from "./coachRouter";
import { paymentsRouter } from "./paymentsRouter";
import { analyticsRouter } from "./analyticsRouter";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User Profile procedures
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      let profile = await db.getUserProfile(ctx.user.id);
      
      // Create profile if it doesn't exist
      if (!profile) {
        await db.createUserProfile({
          userId: ctx.user.id,
          xp: 0,
          level: 1,
          coins: 0,
          currentStreak: 0,
          longestStreak: 0,
          vacationModeActive: 0,
          hasCompletedOnboarding: 0,
          soundEnabled: 1,
        });
        profile = await db.getUserProfile(ctx.user.id);
      }
      
      return profile;
    }),

    update: protectedProcedure
      .input(z.object({
        xp: z.number().optional(),
        level: z.number().optional(),
        coins: z.number().optional(),
        currentStreak: z.number().optional(),
        longestStreak: z.number().optional(),
        lastActiveDate: z.string().optional(),
        vacationModeActive: z.number().optional(),
        vacationModeStartDate: z.string().optional(),
        hasCompletedOnboarding: z.number().optional(),
        selectedFlavor: z.string().optional(),
        selectedContext: z.string().optional(),
        selectedTheme: z.string().optional(),
        mascotMood: z.string().optional(),
        lastPetTime: z.date().optional(),
        lastFeedTime: z.date().optional(),
        purchasedItems: z.array(z.string()).optional(),
        equippedAccessories: z.array(z.string()).optional(),
        soundEnabled: z.number().optional(),
        soundTheme: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // Task procedures
  tasks: router({
    list: protectedProcedure
      .input(z.object({
        completed: z.boolean().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserTasks(ctx.user.id, input?.completed);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        type: z.enum(["quick", "boss"]),
        category: z.string().optional(),
        durationMinutes: z.number().default(5),
        sequenceGroup: z.string().optional(),
        sequenceOrder: z.number().optional(),
        subtasks: z.array(z.object({
          id: z.string(),
          text: z.string(),
          completed: z.boolean(),
        })).optional(),
        xpReward: z.number().default(10),
        coinReward: z.number().default(5),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createTask({
          userId: ctx.user.id,
          ...input,
          completed: 0,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        durationMinutes: z.number().optional(),
        subtasks: z.array(z.object({
          id: z.string(),
          text: z.string(),
          completed: z.boolean(),
        })).optional(),
        completed: z.number().optional(),
        completedAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await db.updateTask(id, ctx.user.id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTask(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Journal procedures
  journal: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserJournalEntries(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        taskTitle: z.string(),
        taskType: z.string(),
        xpEarned: z.number(),
        coinEarned: z.number(),
        completedAt: z.date(),
        date: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createJournalEntry({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  // Daily Affirmation procedures
  affirmation: router({
    getToday: protectedProcedure
      .input(z.object({
        date: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getTodayAffirmation(ctx.user.id, input.date);
      }),

    create: protectedProcedure
      .input(z.object({
        message: z.string(),
        shownDate: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createDailyAffirmation({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  // Habit procedures
  habits: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserHabits(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        frequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
        targetCount: z.number().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createHabit({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    complete: protectedProcedure
      .input(z.object({
        habitId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.completeHabit(input.habitId, ctx.user.id);
      }),

    getCompletions: protectedProcedure
      .input(z.object({
        habitId: z.number(),
        days: z.number().default(30),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getHabitCompletions(input.habitId, ctx.user.id, input.days);
      }),
  }),

  // Mood procedures
  mood: router({
    checkIn: protectedProcedure
      .input(z.object({
        moodLevel: z.number().min(1).max(5),
        energyLevel: z.enum(["low", "medium", "high"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const today = new Date().toISOString().split('T')[0];
        await db.createMoodEntry({
          userId: ctx.user.id,
          date: today,
          ...input,
        });
        return { success: true };
      }),

    getToday: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTodayMoodEntry(ctx.user.id);
    }),

    getHistory: protectedProcedure
      .input(z.object({
        days: z.number().default(30),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getMoodHistory(ctx.user.id, input.days);
      }),
  }),

  // Analytics procedures - merged with new analytics router below

  // Stripe payment procedures
  stripe: router({
    createCheckoutSession: protectedProcedure
      .mutation(async ({ ctx }) => {
        const origin = ctx.req.headers.origin || `http://localhost:${process.env.PORT || 3000}`;
        
        try {
          const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: PRODUCTS.PREMIUM_LIFETIME.currency,
                  product_data: {
                    name: PRODUCTS.PREMIUM_LIFETIME.name,
                    description: PRODUCTS.PREMIUM_LIFETIME.description,
                  },
                  unit_amount: Math.round(PRODUCTS.PREMIUM_LIFETIME.price * 100), // Convert to cents
                },
                quantity: 1,
              },
            ],
            success_url: `${origin}/settings?upgrade=success`,
            cancel_url: `${origin}/settings?upgrade=cancelled`,
            customer_email: ctx.user.email || undefined,
            client_reference_id: ctx.user.id.toString(),
            metadata: {
              user_id: ctx.user.id.toString(),
              customer_email: ctx.user.email || '',
              customer_name: ctx.user.name || '',
            },
            allow_promotion_codes: true,
          });

          return {
            url: session.url,
            sessionId: session.id,
          };
        } catch (error: any) {
          console.error('[Stripe] Error creating checkout session:', error);
          throw new Error(`Failed to create checkout session: ${error.message}`);
        }
      }),

    checkPremiumStatus: protectedProcedure
      .query(async ({ ctx }) => {
        return {
          isPremium: ctx.user.isPremium === 1,
          stripeCustomerId: ctx.user.stripeCustomerId,
        };
      }),
  }),

  // Engagement system procedures
  engagement: router({
    // Leaderboard
    getGlobalLeaderboard: publicProcedure
      .query(async () => {
        return await db.getGlobalLeaderboard(100);
      }),

    getUserRank: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserLeaderboardRank(ctx.user.id);
      }),

    // Contests
    getActiveContests: publicProcedure
      .query(async () => {
        return await db.getActiveContests();
      }),

    getContestProgress: protectedProcedure
      .input(z.object({ contestId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserContestProgress(ctx.user.id, input.contestId);
      }),

    updateContestProgress: protectedProcedure
      .input(z.object({ contestId: z.number(), progress: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateContestProgress(ctx.user.id, input.contestId, input.progress);
        return { success: true };
      }),

    getContestLeaderboard: publicProcedure
      .input(z.object({ contestId: z.number() }))
      .query(async ({ input }) => {
        return await db.getContestLeaderboard(input.contestId);
      }),

    // Rewards
    getAllRewards: publicProcedure
      .query(async () => {
        return await db.getAllRewards();
      }),

    getUserRewards: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserRewards(ctx.user.id);
      }),

    purchaseReward: protectedProcedure
      .input(z.object({ rewardId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getUserProfile(ctx.user.id);
        const reward = (await db.getAllRewards()).find(r => r.id === input.rewardId);

        if (!reward) throw new Error('Reward not found');
        if (!profile || profile.coins < reward.cost) throw new Error('Not enough coins');

        // Deduct coins
        await db.updateUserProfile(ctx.user.id, {
          coins: profile.coins - reward.cost,
        });

        // Add reward
        await db.purchaseReward(ctx.user.id, input.rewardId);

        return { success: true };
      }),

    // Daily Check-in
    getTodayCheckIn: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getTodayCheckIn(ctx.user.id);
      }),

    createCheckIn: protectedProcedure
      .input(z.object({
        energyLevel: z.enum(['low', 'medium', 'high']),
        vibe: z.enum(['anxious', 'bored', 'overwhelmed', 'energized']),
        need: z.enum(['quick-wins', 'deep-focus', 'movement', 'rest']),
      }))
      .mutation(async ({ ctx, input }) => {
        const today = new Date().toISOString().split('T')[0];
        await db.createDailyCheckIn({
          userId: ctx.user.id,
          date: today,
          ...input,
        });
        return { success: true };
      }),

    getCheckInHistory: protectedProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ ctx, input }) => {
        return await db.getCheckInHistory(ctx.user.id, input.days);
      }),
  }),

  emailVerification: router({
    sendVerificationCode: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const code = await db.createEmailVerificationCode(ctx.user.id, input.email);
          console.log(`[Email Verification] Code for ${input.email}: ${code}`);
          return {
            success: true,
            message: 'Verification code sent to email',
          };
        } catch (error: any) {
          console.error('[Email Verification] Error sending code:', error);
          throw new Error('Failed to send verification code');
        }
      }),

    verifyCode: protectedProcedure
      .input(z.object({ code: z.string().length(6) }))
      .mutation(async ({ ctx, input }) => {
        try {
          const verified = await db.verifyEmailCode(ctx.user.id, input.code);
          if (!verified) {
            throw new Error('Invalid or expired verification code');
          }
          return {
            success: true,
            message: 'Email verified successfully',
          };
        } catch (error: any) {
          console.error('[Email Verification] Error verifying code:', error);
          throw new Error('Failed to verify code');
        }
      }),

    getVerificationStatus: protectedProcedure
      .query(async ({ ctx }) => {
        const verifiedEmail = await db.getLatestVerifiedEmail(ctx.user.id);
        return {
          isVerified: verifiedEmail !== null,
          email: verifiedEmail,
        };
      }),
  }),

  compliance: router({
    getLatestTerms: publicProcedure
      .query(async () => {
        const termsVersion = await db.getLatestTermsVersion();
        if (!termsVersion) {
          throw new Error('Terms of Service not found');
        }
        return {
          id: termsVersion.id,
          version: termsVersion.version,
          title: termsVersion.title,
          effectiveDate: termsVersion.effectiveDate,
        };
      }),

    acceptTerms: protectedProcedure
      .input(z.object({ termsVersionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const ipAddress = (ctx.req.headers['x-forwarded-for'] as string) || ctx.req.socket.remoteAddress || undefined;
          await db.recordTermsAcceptance(ctx.user.id, input.termsVersionId, ipAddress);
          return { success: true, message: 'Terms accepted' };
        } catch (error: any) {
          console.error('[Terms Acceptance] Error:', error);
          throw new Error('Failed to record terms acceptance');
        }
      }),

    hasAcceptedLatestTerms: protectedProcedure
      .query(async ({ ctx }) => {
        const latestTerms = await db.getLatestTermsVersion();
        if (!latestTerms) return false;
        
        const accepted = await db.hasUserAcceptedTermsVersion(ctx.user.id, latestTerms.id);
        return accepted;
      }),
  }),
  decisionTree: decisionTreeRouter,
  pickAndWin: pickAndWinRouter,
  feedback: feedbackRouter,
  retention: retentionRouter,
  coach: coachRouter,
  payments: paymentsRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
