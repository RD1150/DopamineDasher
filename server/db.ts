import { eq, and, desc, or, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userProfiles, InsertUserProfile, tasks, InsertTask, journalEntries, InsertJournalEntry, dailyAffirmations, InsertDailyAffirmation, habits, InsertHabit, habitCompletions, InsertHabitCompletion, moodEntries, InsertMoodEntry, userStats, InsertUserStats, leaderboardEntries, InsertLeaderboardEntry, contests, InsertContest, contestParticipation, InsertContestParticipation, rewards, InsertReward, userRewards, InsertUserReward, dailyCheckIns, InsertDailyCheckIn, termsVersions, InsertTermsVersion, userTermsAcceptance, InsertUserTermsAcceptance, emailVerificationCodes, InsertEmailVerificationCode, nervousSystemStates, InsertNervousSystemState, decisionTreeSessions, InsertDecisionTreeSession, characterPicks, InsertCharacterPick, weeklyCharacterPicks, InsertWeeklyCharacterPick, analyticsEvents, InsertAnalyticsEvent, notificationABTests, InsertNotificationABTest, streakMilestones, InsertStreakMilestone } from "../drizzle/schema";
import { ENV } from './_core/env';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
    } else if (user.openId === ENV.ownerOpenId) {
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

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// User Profile functions
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserProfile(profile: InsertUserProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(userProfiles).values(profile);
}

export async function updateUserProfile(userId: number, updates: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(userProfiles).set(updates).where(eq(userProfiles.userId, userId));
}

// Task functions
export async function getUserTasks(userId: number, completed?: boolean) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(tasks.userId, userId)];
  if (completed !== undefined) {
    conditions.push(eq(tasks.completed, completed ? 1 : 0));
  }

  return await db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt));
}

export async function createTask(task: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tasks).values(task);
  return result;
}

export async function updateTask(taskId: number, userId: number, updates: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(tasks).set(updates).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}

export async function deleteTask(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}

// Journal functions
export async function getUserJournalEntries(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.completedAt));
}

export async function createJournalEntry(entry: InsertJournalEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(journalEntries).values(entry);
}

// Daily Affirmation functions
export async function getTodayAffirmation(userId: number, date: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(dailyAffirmations)
    .where(and(eq(dailyAffirmations.userId, userId), eq(dailyAffirmations.shownDate, date)))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createDailyAffirmation(affirmation: InsertDailyAffirmation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(dailyAffirmations).values(affirmation);
}

// ============ HABIT FUNCTIONS ============

export async function getUserHabits(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.isActive, 1)))
    .orderBy(desc(habits.createdAt));
}

export async function createHabit(habit: InsertHabit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(habits).values(habit);
  return result;
}

export async function updateHabit(habitId: number, userId: number, updates: Partial<InsertHabit>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(habits).set(updates).where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
}

export async function deleteHabit(habitId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(habits).set({ isActive: 0 }).where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
}

export async function getHabitCompletions(habitId: number, userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  return await db.select().from(habitCompletions)
    .where(and(
      eq(habitCompletions.habitId, habitId),
      eq(habitCompletions.userId, userId),
      gte(habitCompletions.date, startDateStr)
    ))
    .orderBy(desc(habitCompletions.date));
}

export async function completeHabit(habitId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date().toISOString().split('T')[0];
  
  const existing = await db.select().from(habitCompletions)
    .where(and(
      eq(habitCompletions.habitId, habitId),
      eq(habitCompletions.userId, userId),
      eq(habitCompletions.date, today)
    ))
    .limit(1);

  if (existing.length > 0) {
    return { alreadyCompleted: true };
  }

  await db.insert(habitCompletions).values({
    habitId,
    userId,
    completedAt: new Date(),
    date: today,
  });

  const habit = await db.select().from(habits).where(eq(habits.id, habitId)).limit(1);
  if (habit.length > 0) {
    const h = habit[0];
    const newStreak = (h.currentStreak || 0) + 1;
    const longestStreak = Math.max(newStreak, h.longestStreak || 0);
    
    await db.update(habits).set({
      currentStreak: newStreak,
      longestStreak: longestStreak,
      lastCompletedDate: today,
    }).where(eq(habits.id, habitId));
  }

  return { success: true };
}

// ============ MOOD FUNCTIONS ============

export async function createMoodEntry(entry: InsertMoodEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(moodEntries).values(entry);
}

export async function getTodayMoodEntry(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const today = new Date().toISOString().split('T')[0];
  const result = await db.select().from(moodEntries)
    .where(and(eq(moodEntries.userId, userId), eq(moodEntries.date, today)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getMoodHistory(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  return await db.select().from(moodEntries)
    .where(and(
      eq(moodEntries.userId, userId),
      gte(moodEntries.date, startDateStr)
    ))
    .orderBy(desc(moodEntries.date));
}

// ============ ANALYTICS FUNCTIONS ============

export async function getUserStats(userId: number, date: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userStats)
    .where(and(eq(userStats.userId, userId), eq(userStats.date, date)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getStatsHistory(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  return await db.select().from(userStats)
    .where(and(
      eq(userStats.userId, userId),
      gte(userStats.date, startDateStr)
    ))
    .orderBy(desc(userStats.date));
}

export async function updateUserStats(userId: number, date: string, updates: Partial<InsertUserStats>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserStats(userId, date);
  
  if (existing) {
    await db.update(userStats).set(updates).where(
      and(eq(userStats.userId, userId), eq(userStats.date, date))
    );
  } else {
    await db.insert(userStats).values({
      userId,
      date,
      ...updates,
    });
  }
}


// ============ LEADERBOARD FUNCTIONS ============

export async function getGlobalLeaderboard(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: leaderboardEntries.id,
    userId: leaderboardEntries.userId,
    currentStreak: leaderboardEntries.currentStreak,
    totalTasksCompleted: leaderboardEntries.totalTasksCompleted,
    totalCoins: leaderboardEntries.totalCoins,
    globalRank: leaderboardEntries.globalRank,
  })
    .from(leaderboardEntries)
    .orderBy(desc(leaderboardEntries.totalCoins))
    .limit(limit);
}

export async function updateLeaderboardEntry(userId: number, updates: Partial<InsertLeaderboardEntry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(leaderboardEntries)
    .where(eq(leaderboardEntries.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db.update(leaderboardEntries).set(updates).where(eq(leaderboardEntries.userId, userId));
  } else {
    await db.insert(leaderboardEntries).values({
      userId,
      ...updates,
    });
  }
}

export async function getUserLeaderboardRank(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(leaderboardEntries)
    .where(eq(leaderboardEntries.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============ CONTEST FUNCTIONS ============

export async function getActiveContests() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(contests)
    .where(eq(contests.active, 1))
    .orderBy(desc(contests.startDate));
}

export async function createContest(contest: InsertContest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contests).values(contest);
  return result;
}

export async function getUserContestProgress(userId: number, contestId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(contestParticipation)
    .where(and(
      eq(contestParticipation.userId, userId),
      eq(contestParticipation.contestId, contestId)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateContestProgress(userId: number, contestId: number, progress: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserContestProgress(userId, contestId);

  if (existing) {
    await db.update(contestParticipation)
      .set({ progress })
      .where(and(
        eq(contestParticipation.userId, userId),
        eq(contestParticipation.contestId, contestId)
      ));
  } else {
    await db.insert(contestParticipation).values({
      userId,
      contestId,
      progress,
    });
  }
}

export async function getContestLeaderboard(contestId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(contestParticipation)
    .where(eq(contestParticipation.contestId, contestId))
    .orderBy(desc(contestParticipation.progress))
    .limit(limit);
}

// ============ REWARD FUNCTIONS ============

export async function getAllRewards() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(rewards).orderBy(desc(rewards.cost));
}

export async function getUserRewards(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: userRewards.id,
    userId: userRewards.userId,
    rewardId: userRewards.rewardId,
    name: rewards.name,
    emoji: rewards.emoji,
    type: rewards.type,
    rarity: rewards.rarity,
    unlockedAt: userRewards.unlockedAt,
  })
    .from(userRewards)
    .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
    .where(eq(userRewards.userId, userId))
    .orderBy(desc(userRewards.unlockedAt));
}

export async function purchaseReward(userId: number, rewardId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(userRewards).values({
    userId,
    rewardId,
  });
}

// ============ DAILY CHECK-IN FUNCTIONS ============

export async function getTodayCheckIn(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const today = new Date().toISOString().split('T')[0];
  const result = await db.select().from(dailyCheckIns)
    .where(and(
      eq(dailyCheckIns.userId, userId),
      eq(dailyCheckIns.date, today)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createDailyCheckIn(checkIn: InsertDailyCheckIn) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(dailyCheckIns).values(checkIn);
}

export async function getCheckInHistory(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  return await db.select().from(dailyCheckIns)
    .where(and(
      eq(dailyCheckIns.userId, userId),
      gte(dailyCheckIns.date, startDateStr)
    ))
    .orderBy(desc(dailyCheckIns.date));
}


// ============ EMAIL VERIFICATION FUNCTIONS ============

export async function createEmailVerificationCode(userId: number, email: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Code expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  await db.insert(emailVerificationCodes).values({
    userId,
    email,
    code,
    expiresAt,
  });
  
  return code;
}

export async function verifyEmailCode(userId: number, code: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(emailVerificationCodes)
    .where(and(
      eq(emailVerificationCodes.userId, userId),
      eq(emailVerificationCodes.code, code),
      gte(emailVerificationCodes.expiresAt, new Date())
    ))
    .limit(1);
  
  if (result.length === 0) return false;
  
  // Mark as verified
  await db.update(emailVerificationCodes)
    .set({ verified: 1 })
    .where(eq(emailVerificationCodes.id, result[0].id));
  
  return true;
}

export async function getLatestVerifiedEmail(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(emailVerificationCodes)
    .where(and(
      eq(emailVerificationCodes.userId, userId),
      eq(emailVerificationCodes.verified, 1)
    ))
    .orderBy(desc(emailVerificationCodes.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0].email : null;
}

// ============ TERMS VERSION FUNCTIONS ============
export async function createTermsVersion(data: InsertTermsVersion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(termsVersions).values(data);
  return result;
}

export async function getLatestTermsVersion() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(termsVersions)
    .orderBy(desc(termsVersions.effectiveDate))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getTermsVersionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(termsVersions)
    .where(eq(termsVersions.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function recordTermsAcceptance(userId: number, termsVersionId: number, ipAddress?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(userTermsAcceptance).values({
    userId,
    termsVersionId,
    ipAddress,
  });
}

export async function getUserLatestTermsAcceptance(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(userTermsAcceptance)
    .where(eq(userTermsAcceptance.userId, userId))
    .orderBy(desc(userTermsAcceptance.acceptedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function hasUserAcceptedTermsVersion(userId: number, termsVersionId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(userTermsAcceptance)
    .where(and(
      eq(userTermsAcceptance.userId, userId),
      eq(userTermsAcceptance.termsVersionId, termsVersionId)
    ))
    .limit(1);
  
  return result.length > 0;
}


// Decision Tree functions

export async function recordNervousSystemState(userId: number, state: "squirrel" | "tired" | "focused" | "hurting", description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(nervousSystemStates).values({
    userId,
    state,
    description,
    recordedAt: new Date(),
  });
}

export async function getLatestNervousSystemState(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select()
    .from(nervousSystemStates)
    .where(eq(nervousSystemStates.userId, userId))
    .orderBy(desc(nervousSystemStates.recordedAt))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createDecisionTreeSession(session: InsertDecisionTreeSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(decisionTreeSessions).values(session);
  return result;
}

export async function getDecisionTreeSession(sessionId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select()
    .from(decisionTreeSessions)
    .where(and(
      eq(decisionTreeSessions.id, sessionId),
      eq(decisionTreeSessions.userId, userId)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getTasksByActivationEnergy(userId: number, activationEnergy: "micro" | "easy" | "medium" | "deep") {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      eq(tasks.completed, 0),
      eq(tasks.activationEnergy, activationEnergy)
    ))
    .orderBy(desc(tasks.createdAt));
}

export async function getTasksByState(userId: number, state: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      eq(tasks.completed, 0),
      eq(tasks.recommendedState, state)
    ))
    .orderBy(desc(tasks.createdAt));
}

export async function getTasksBySequenceGroup(userId: number, sequenceGroup: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      eq(tasks.completed, 0),
      eq(tasks.sequenceGroup, sequenceGroup)
    ))
    .orderBy(tasks.sequenceOrder);
}


// ============ PICK & WIN FUNCTIONS ============

export async function createCharacterPick(pick: InsertCharacterPick) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(characterPicks).values(pick);
  return pick;
}

export async function getCharacterPickHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(characterPicks).where(eq(characterPicks.userId, userId));
}

export async function getWeeklyCharacterPick(userId: number, weekStartDate: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(weeklyCharacterPicks)
    .where(and(
      eq(weeklyCharacterPicks.userId, userId),
      eq(weeklyCharacterPicks.weekStartDate, weekStartDate)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createWeeklyCharacterPick(pick: InsertWeeklyCharacterPick) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(weeklyCharacterPicks).values(pick);
  return pick;
}


// ============ FEEDBACK FUNCTIONS ============

export async function submitFeedback(data: {
  userId: number | null;
  type: 'bug' | 'feature' | 'general';
  message: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { feedbacks } = await import("../drizzle/schema");
  await db.insert(feedbacks).values({
    userId: data.userId,
    type: data.type,
    message: data.message,
  });
}

export async function getAllFeedback() {
  const db = await getDb();
  if (!db) return [];

  const { feedbacks } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  
  return await db.select().from(feedbacks).orderBy(desc(feedbacks.createdAt));
}

export async function getFeedbackStats() {
  const db = await getDb();
  if (!db) return [];

  const { feedbacks } = await import("../drizzle/schema");
  const { sql } = await import("drizzle-orm");
  
  return await db.select({
    type: feedbacks.type,
    count: sql<number>`COUNT(*)`.as('count'),
  }).from(feedbacks).groupBy(feedbacks.type);
}

// ============ RETENTION ANALYTICS FUNCTIONS ============

export async function recordUserSession(userId: number) {
  const db = await getDb();
  if (!db) return;

  const { userProfiles } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");

  // Get user profile
  const profile = await db.select().from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (!profile.length) return;

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Update last active date for streak tracking
  await db.update(userProfiles)
    .set({ lastActiveDate: today })
    .where(eq(userProfiles.userId, userId));
}

export async function getUserRetentionMetrics(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const { userProfiles } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const profile = await db.select().from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (!profile.length) return null;

  const p = profile[0];
  const createdAt = new Date(p.createdAt);
  const now = new Date();
  const daysSinceSignup = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  return {
    userId,
    daysSinceSignup,
    lastActiveDate: p.lastActiveDate,
    currentStreak: p.currentStreak,
    createdAt: p.createdAt,
  };
}

export async function getRetentionCohort(days: number) {
  const db = await getDb();
  if (!db) return [];

  const { users, userProfiles } = await import("../drizzle/schema");
  const { eq, gte, lte, and, sql } = await import("drizzle-orm");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Get users created in the last N days
  const cohort = await db.select({
    userId: users.id,
    email: users.email,
    createdAt: users.createdAt,
    lastActiveDate: userProfiles.lastActiveDate,
    isActive: sql<boolean>`${userProfiles.lastActiveDate} IS NOT NULL`,
  }).from(users)
    .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(and(
      gte(users.createdAt, cutoffDate),
      lte(users.createdAt, new Date())
    ));

  return cohort;
}


/**
 * Store a coach conversation in the database
 */
export async function storeCoachConversation(
  userId: number,
  nervousSystemState: 'squirrel' | 'tired' | 'focused' | 'hurting',
  userMessage: string,
  coachMessage: string,
  suggestedTechniqueId?: string,
  suggestedTechniqueName?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot store coach conversation: database not available");
    return null;
  }

  try {
    const { coachConversations } = await import("../drizzle/schema");
    const result = await db.insert(coachConversations).values({
      userId,
      nervousSystemState,
      userMessage,
      coachMessage,
      suggestedTechniqueId,
      suggestedTechniqueName
    });
    return result;
  } catch (error) {
    console.error("[Database] Error storing coach conversation:", error);
    return null;
  }
}

/**
 * Get coach conversation history for a user
 */
export async function getCoachConversationHistory(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { coachConversations } = await import("../drizzle/schema");
    const { eq, desc } = await import("drizzle-orm");
    
    const conversations = await db
      .select()
      .from(coachConversations)
      .where(eq(coachConversations.userId, userId))
      .orderBy(desc(coachConversations.createdAt))
      .limit(limit);
    
    return conversations;
  } catch (error) {
    console.error("[Database] Error fetching coach conversations:", error);
    return [];
  }
}

/**
 * Record user feedback on a technique
 */
export async function recordTechniqueFeedback(
  conversationId: number,
  helpfulRating: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record technique feedback: database not available");
    return null;
  }

  try {
    const { coachConversations } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    const result = await db
      .update(coachConversations)
      .set({
        techniqueHelpfulRating: helpfulRating,
        techniqueNotes: notes
      })
      .where(eq(coachConversations.id, conversationId));
    
    return result;
  } catch (error) {
    console.error("[Database] Error recording technique feedback:", error);
    return null;
  }
}

/**
 * Update user technique effectiveness tracking
 */
export async function updateTechniqueEffectiveness(
  userId: number,
  techniqueId: string,
  techniqueName: string,
  techniqueCategory: 'grounding' | 'motivation' | 'breakdown' | 'cognitive' | 'emotion',
  nervousSystemState: 'squirrel' | 'tired' | 'focused' | 'hurting',
  helpfulRating: number
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update technique effectiveness: database not available");
    return null;
  }

  try {
    const { userTechniqueEffectiveness } = await import("../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");
    
    // Check if record exists
    const existing = await db
      .select()
      .from(userTechniqueEffectiveness)
      .where(
        and(
          eq(userTechniqueEffectiveness.userId, userId),
          eq(userTechniqueEffectiveness.techniqueId, techniqueId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      const current = existing[0];
      const newTotalRatings = current.totalRatings + 1;
      const newAverageRating = (parseFloat(current.averageRating.toString()) * current.totalRatings + helpfulRating) / newTotalRatings;
      
      // Count positive ratings for this state
      const stateField = `effectiveFor${nervousSystemState.charAt(0).toUpperCase() + nervousSystemState.slice(1)}` as const;
      const updates: Record<string, unknown> = {
        timesUsed: current.timesUsed + 1,
        averageRating: newAverageRating,
        totalRatings: newTotalRatings
      };
      
      if (helpfulRating >= 4) {
        updates[stateField] = (current[stateField as keyof typeof current] as number) + 1;
      }

      await db
        .update(userTechniqueEffectiveness)
        .set(updates)
        .where(
          and(
            eq(userTechniqueEffectiveness.userId, userId),
            eq(userTechniqueEffectiveness.techniqueId, techniqueId)
          )
        );
    } else {
      // Create new record
      const updates: Record<string, unknown> = {
        userId,
        techniqueId,
        techniqueName,
        techniqueCategory,
        timesUsed: 1,
        averageRating: helpfulRating,
        totalRatings: 1
      };
      
      if (helpfulRating >= 4) {
        const stateField = `effectiveFor${nervousSystemState.charAt(0).toUpperCase() + nervousSystemState.slice(1)}`;
        updates[stateField] = 1;
      }

      await db.insert(userTechniqueEffectiveness).values(updates as any);
    }
    
    return true;
  } catch (error) {
    console.error("[Database] Error updating technique effectiveness:", error);
    return null;
  }
}

/**
 * Get user's most effective techniques for a nervous system state
 */
export async function getEffectiveTechniquesForUser(
  userId: number,
  nervousSystemState: 'squirrel' | 'tired' | 'focused' | 'hurting',
  limit: number = 5
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { userTechniqueEffectiveness } = await import("../drizzle/schema");
    const { eq, desc } = await import("drizzle-orm");
    
    const stateField = `effectiveFor${nervousSystemState.charAt(0).toUpperCase() + nervousSystemState.slice(1)}` as const;
    
    const techniques = await db
      .select()
      .from(userTechniqueEffectiveness)
      .where(eq(userTechniqueEffectiveness.userId, userId))
      .orderBy(desc(userTechniqueEffectiveness.averageRating))
      .limit(limit);
    
    return techniques;
  } catch (error) {
    console.error("[Database] Error fetching effective techniques:", error);
    return [];
  }
}


// ============ COIN PURCHASE FUNCTIONS ============

/**
 * Add coins to user account after successful payment
 */
export async function addCoinsToUser(userId: number, coins: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { eq } = await import("drizzle-orm");
    
    // Get current profile
    const profile = await db.select().from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (!profile.length) {
      throw new Error("User profile not found");
    }

    const currentCoins = profile[0].coins || 0;
    const newCoins = currentCoins + coins;

    // Update coins
    await db.update(userProfiles)
      .set({ coins: newCoins })
      .where(eq(userProfiles.userId, userId));

    // Return updated profile
    const updated = await db.select().from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    return updated[0];
  } catch (error) {
    console.error("[Database] Error adding coins to user:", error);
    throw error;
  }
}

/**
 * Get user's coin balance
 */
export async function getUserCoins(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  try {
    const { eq } = await import("drizzle-orm");
    
    const profile = await db.select().from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    return profile.length > 0 ? (profile[0].coins || 0) : 0;
  } catch (error) {
    console.error("[Database] Error getting user coins:", error);
    return 0;
  }
}


// ============ PAYMENT HISTORY FUNCTIONS ============

/**
 * Create a coin purchase record
 */
export async function createCoinPurchase(
  userId: number,
  packageId: string,
  coinsAmount: number,
  priceInCents: number,
  stripePaymentIntentId: string,
  stripeSessionId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { coinPurchases } = await import("../drizzle/schema.js");
    
    const result = await db.insert(coinPurchases).values({
      userId,
      packageId,
      coinsAmount,
      priceInCents,
      stripePaymentIntentId,
      stripeSessionId,
      status: "pending",
    });

    return result;
  } catch (error) {
    console.error("[Database] Error creating coin purchase:", error);
    throw error;
  }
}

/**
 * Update coin purchase status
 */
export async function updateCoinPurchaseStatus(
  stripePaymentIntentId: string,
  status: "pending" | "completed" | "failed" | "refunded"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { coinPurchases } = await import("../drizzle/schema.js");
    const { eq } = await import("drizzle-orm");

    const completedAt = status === "completed" ? new Date() : null;

    await db
      .update(coinPurchases)
      .set({
        status,
        completedAt,
      })
      .where(eq(coinPurchases.stripePaymentIntentId, stripePaymentIntentId));
  } catch (error) {
    console.error("[Database] Error updating coin purchase status:", error);
    throw error;
  }
}

/**
 * Get user's payment history
 */
export async function getUserPaymentHistory(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { coinPurchases } = await import("../drizzle/schema.js");
    const { eq, desc } = await import("drizzle-orm");

    const history = await db
      .select()
      .from(coinPurchases)
      .where(eq(coinPurchases.userId, userId))
      .orderBy(desc(coinPurchases.createdAt))
      .limit(limit);

    return history;
  } catch (error) {
    console.error("[Database] Error getting payment history:", error);
    return [];
  }
}

// ============ REFERRAL FUNCTIONS ============

/**
 * Create a referral code for a user
 */
export async function createReferralCode(referrerId: number, referralCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { referrals } = await import("../drizzle/schema.js");

    const result = await db.insert(referrals).values({
      referrerId,
      referredUserId: referrerId, // Placeholder, will be updated when referred user signs up
      referralCode,
      isActive: 1,
    });

    return result;
  } catch (error) {
    console.error("[Database] Error creating referral code:", error);
    throw error;
  }
}

/**
 * Get referral code by code string
 */
export async function getReferralByCode(referralCode: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { referrals } = await import("../drizzle/schema.js");
    const { eq } = await import("drizzle-orm");

    const referral = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referralCode, referralCode))
      .limit(1);

    return referral.length > 0 ? referral[0] : null;
  } catch (error) {
    console.error("[Database] Error getting referral by code:", error);
    return null;
  }
}

/**
 * Award referral bonus coins
 */
export async function awardReferralBonus(referrerId: number, referredUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { referrals, userProfiles } = await import("../drizzle/schema.js");
    const { eq } = await import("drizzle-orm");

    // Award coins to both referrer and referred user
    const referrerProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, referrerId))
      .limit(1);

    const referredProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, referredUserId))
      .limit(1);

    if (referrerProfile.length > 0) {
      await db
        .update(userProfiles)
        .set({
          coins: (referrerProfile[0].coins || 0) + 50, // Referrer gets 50 coins
        })
        .where(eq(userProfiles.userId, referrerId));
    }

    if (referredProfile.length > 0) {
      await db
        .update(userProfiles)
        .set({
          coins: (referredProfile[0].coins || 0) + 25, // Referred user gets 25 coins
        })
        .where(eq(userProfiles.userId, referredUserId));
    }

    // Update referral record
    await db
      .update(referrals)
      .set({
        referredUserId,
        bonusCoinsAwarded: 75, // Total awarded
        claimedAt: new Date(),
        bonusAwardedAt: new Date(),
      })
      .where(eq(referrals.referrerId, referrerId));
  } catch (error) {
    console.error("[Database] Error awarding referral bonus:", error);
    throw error;
  }
}

/**
 * Get user's referral statistics
 */
export async function getUserReferralStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { referrals } = await import("../drizzle/schema.js");
    const { eq } = await import("drizzle-orm");

    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    const successfulReferrals = userReferrals.filter((r) => r.claimedAt !== null);
    const totalBonusCoins = userReferrals.reduce((sum, r) => sum + (r.bonusCoinsAwarded || 0), 0);

    return {
      totalReferrals: userReferrals.length,
      successfulReferrals: successfulReferrals.length,
      totalBonusCoins,
      referrals: userReferrals,
    };
  } catch (error) {
    console.error("[Database] Error getting referral stats:", error);
    return null;
  }
}


// Analytics functions
export async function trackAnalyticsEvent(userId: number, eventType: string, metadata?: Record<string, any>) {
  const db = await getDb();
  if (!db) return;

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    await db.insert(analyticsEvents).values({
      userId,
      eventType: eventType as any,
      metadata: metadata || {},
      date: today,
    });
  } catch (error) {
    console.error("[Database] Error tracking analytics event:", error);
  }
}

export async function getAnalyticsSummary(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return null;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const events = await db
      .select()
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.userId, userId),
          gte(analyticsEvents.date, startDateStr)
        )
      );

    const signups = events.filter(e => e.eventType === 'signup').length;
    const onboardingCompletes = events.filter(e => e.eventType === 'onboarding_complete').length;
    const taskCompletes = events.filter(e => e.eventType === 'task_complete').length;
    const premiumUpgrades = events.filter(e => e.eventType === 'premium_upgrade').length;

    return {
      totalEvents: events.length,
      signups,
      onboardingCompletes,
      taskCompletes,
      premiumUpgrades,
      eventsByDay: events.reduce((acc, event) => {
        acc[event.date] = (acc[event.date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    console.error("[Database] Error getting analytics summary:", error);
    return null;
  }
}

// Notification A/B Test functions
export async function assignNotificationVariant(userId: number, testId: string): Promise<'control' | 'variant_a' | 'variant_b'> {
  // Simple assignment based on user ID hash
  const hash = userId % 3;
  if (hash === 0) return 'control';
  if (hash === 1) return 'variant_a';
  return 'variant_b';
}

export async function trackNotificationSent(
  userId: number,
  testId: string,
  variant: 'control' | 'variant_a' | 'variant_b',
  message: string
) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(notificationABTests).values({
      userId,
      testId,
      variant,
      message,
    });
  } catch (error) {
    console.error("[Database] Error tracking notification:", error);
  }
}

export async function trackNotificationEngagement(
  userId: number,
  testId: string,
  engagement: 'clicked' | 'dismissed',
  taskCompletedAfter: boolean = false
) {
  const db = await getDb();
  if (!db) return;

  try {
    const updates: any = {};
    if (engagement === 'clicked') {
      updates.clicked = 1;
      updates.clickedAt = new Date();
    } else if (engagement === 'dismissed') {
      updates.dismissed = 1;
    }
    if (taskCompletedAfter) {
      updates.taskCompletedAfter = 1;
    }

    await db
      .update(notificationABTests)
      .set(updates)
      .where(
        and(
          eq(notificationABTests.userId, userId),
          eq(notificationABTests.testId, testId)
        )
      );
  } catch (error) {
    console.error("[Database] Error tracking notification engagement:", error);
  }
}

export async function getNotificationABTestResults(testId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const results = await db
      .select()
      .from(notificationABTests)
      .where(eq(notificationABTests.testId, testId));

    const byVariant = {
      control: results.filter(r => r.variant === 'control'),
      variant_a: results.filter(r => r.variant === 'variant_a'),
      variant_b: results.filter(r => r.variant === 'variant_b'),
    };

    const calculateMetrics = (variant: any[]) => ({
      sent: variant.length,
      clicked: variant.filter(r => r.clicked).length,
      dismissed: variant.filter(r => r.dismissed).length,
      taskCompleted: variant.filter(r => r.taskCompletedAfter).length,
      clickRate: variant.length > 0 ? (variant.filter(r => r.clicked).length / variant.length) * 100 : 0,
      conversionRate: variant.length > 0 ? (variant.filter(r => r.taskCompletedAfter).length / variant.length) * 100 : 0,
    });

    return {
      control: calculateMetrics(byVariant.control),
      variant_a: calculateMetrics(byVariant.variant_a),
      variant_b: calculateMetrics(byVariant.variant_b),
    };
  } catch (error) {
    console.error("[Database] Error getting A/B test results:", error);
    return null;
  }
}

// Streak Milestone functions
export async function recordStreakMilestone(
  userId: number,
  streakDays: number,
  coinReward: number = 0
) {
  const db = await getDb();
  if (!db) return;

  try {
    let milestoneType: 'seven_day' | 'thirty_day' | 'hundred_day' | 'custom' = 'custom';
    if (streakDays === 7) milestoneType = 'seven_day';
    else if (streakDays === 30) milestoneType = 'thirty_day';
    else if (streakDays === 100) milestoneType = 'hundred_day';

    const badgeMap: Record<number, string> = {
      7: 'streak_7_day',
      30: 'streak_30_day',
      100: 'streak_100_day',
    };

    await db.insert(streakMilestones).values({
      userId,
      streakDays,
      milestoneType,
      achievedAt: new Date(),
      badgeEarned: badgeMap[streakDays] || `streak_${streakDays}_day`,
      coinReward,
    });
  } catch (error) {
    console.error("[Database] Error recording streak milestone:", error);
  }
}

export async function getStreakMilestones(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const milestones = await db
      .select()
      .from(streakMilestones)
      .where(eq(streakMilestones.userId, userId))
      .orderBy(desc(streakMilestones.achievedAt));

    return milestones;
  } catch (error) {
    console.error("[Database] Error getting streak milestones:", error);
    return [];
  }
}

export async function markMilestoneAsShown(milestoneId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(streakMilestones)
      .set({ celebrationShown: 1 })
      .where(eq(streakMilestones.id, milestoneId));
  } catch (error) {
    console.error("[Database] Error marking milestone as shown:", error);
  }
}

export async function markMilestoneAsShared(milestoneId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(streakMilestones)
      .set({ shared: 1 })
      .where(eq(streakMilestones.id, milestoneId));
  } catch (error) {
    console.error("[Database] Error marking milestone as shared:", error);
  }
}
