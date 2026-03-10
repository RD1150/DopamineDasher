import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { socialShares } from "../drizzle/schema";

export const sharingRouter = router({
  /**
   * Record a social share event
   */
  recordShare: protectedProcedure
    .input(z.object({
      taskTitle: z.string(),
      platform: z.enum(["twitter", "linkedin", "facebook", "clipboard"]),
      message: z.string().optional(),
      timeSpent: z.number().optional(), // in seconds
      streakCount: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.insert(socialShares).values({
          userId: ctx.user.id,
          taskTitle: input.taskTitle,
          platform: input.platform,
          message: input.message,
          timeSpent: input.timeSpent,
          streakCount: input.streakCount,
        });
        return { success: true };
      } catch (error) {
        console.error("Failed to record share:", error);
        return { success: false, error: "Failed to record share" };
      }
    }),

  /**
   * Get user's share history
   */
  getShareHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        const shares = await db
          .select()
          .from(socialShares)
          .where(socialShares.userId.equals(ctx.user.id))
          .orderBy(socialShares.sharedAt.desc())
          .limit(input.limit)
          .offset(input.offset);
        return shares;
      } catch (error) {
        console.error("Failed to get share history:", error);
        return [];
      }
    }),

  /**
   * Get share statistics for the user
   */
  getShareStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return {
        totalShares: 0,
        sharesByPlatform: {
          twitter: 0,
          linkedin: 0,
          facebook: 0,
          clipboard: 0,
        },
        mostSharedTask: null,
      };
      const shares = await db
        .select()
        .from(socialShares)
        .where(socialShares.userId.equals(ctx.user.id));

      const stats = {
        totalShares: shares.length,
        sharesByPlatform: {
          twitter: shares.filter((s) => s.platform === "twitter").length,
          linkedin: shares.filter((s) => s.platform === "linkedin").length,
          facebook: shares.filter((s) => s.platform === "facebook").length,
          clipboard: shares.filter((s) => s.platform === "clipboard").length,
        },
        mostSharedTask: shares.length > 0
          ? shares.reduce((acc, curr) => {
              const existing = acc.find((item) => item.title === curr.taskTitle);
              if (existing) {
                existing.count++;
              } else {
                acc.push({ title: curr.taskTitle, count: 1 });
              }
              return acc;
            }, [] as Array<{ title: string; count: number }>)
            .sort((a, b) => b.count - a.count)[0]
          : null,
      };

      return stats;
    } catch (error) {
      console.error("Failed to get share stats:", error);
      return {
        totalShares: 0,
        sharesByPlatform: {
          twitter: 0,
          linkedin: 0,
          facebook: 0,
          clipboard: 0,
        },
        mostSharedTask: null,
      };
    }
  }),
});
