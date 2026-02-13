import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  trackAnalyticsEvent,
  getAnalyticsSummary,
  assignNotificationVariant,
  trackNotificationSent,
  trackNotificationEngagement,
  getNotificationABTestResults,
  recordStreakMilestone,
  getStreakMilestones,
  markMilestoneAsShown,
  markMilestoneAsShared,
} from "./db";

export const analyticsRouter = router({
  // Track analytics events
  trackEvent: protectedProcedure
    .input(
      z.object({
        eventType: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await trackAnalyticsEvent(ctx.user.id, input.eventType, input.metadata);
      return { success: true };
    }),

  // Get analytics summary for current user
  getSummary: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input, ctx }) => {
      const summary = await getAnalyticsSummary(ctx.user.id, input.days);
      return summary;
    }),

  // Notification A/B Testing
  getNotificationVariant: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input, ctx }) => {
      const variant = await assignNotificationVariant(ctx.user.id, input.testId);
      return { variant };
    }),

  sendNotification: protectedProcedure
    .input(
      z.object({
        testId: z.string(),
        variant: z.enum(["control", "variant_a", "variant_b"]),
        message: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await trackNotificationSent(ctx.user.id, input.testId, input.variant, input.message);
      return { success: true };
    }),

  trackNotificationClick: protectedProcedure
    .input(
      z.object({
        testId: z.string(),
        taskCompletedAfter: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await trackNotificationEngagement(ctx.user.id, input.testId, "clicked", input.taskCompletedAfter);
      return { success: true };
    }),

  trackNotificationDismiss: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await trackNotificationEngagement(ctx.user.id, input.testId, "dismissed");
      return { success: true };
    }),

  getABTestResults: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input }) => {
      const results = await getNotificationABTestResults(input.testId);
      return results;
    }),

  // Streak Milestones
  recordMilestone: protectedProcedure
    .input(
      z.object({
        streakDays: z.number(),
        coinReward: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await recordStreakMilestone(ctx.user.id, input.streakDays, input.coinReward || 0);
      return { success: true };
    }),

  getMilestones: protectedProcedure.query(async ({ ctx }) => {
    const milestones = await getStreakMilestones(ctx.user.id);
    return milestones;
  }),

  markMilestoneShown: protectedProcedure
    .input(z.object({ milestoneId: z.number() }))
    .mutation(async ({ input }) => {
      await markMilestoneAsShown(input.milestoneId);
      return { success: true };
    }),

  markMilestoneShared: protectedProcedure
    .input(z.object({ milestoneId: z.number() }))
    .mutation(async ({ input }) => {
      await markMilestoneAsShared(input.milestoneId);
      return { success: true };
    }),
});
