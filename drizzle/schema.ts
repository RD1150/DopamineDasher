import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, longtext, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isPremium: int("isPremium").notNull().default(0), // 0 or 1 for boolean
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User profile and game state
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Game progression
  xp: int("xp").notNull().default(0),
  level: int("level").notNull().default(1),
  coins: int("coins").notNull().default(0),
  
  // Streak tracking
  currentStreak: int("currentStreak").notNull().default(0),
  longestStreak: int("longestStreak").notNull().default(0),
  lastActiveDate: varchar("lastActiveDate", { length: 10 }), // YYYY-MM-DD format
  vacationModeActive: int("vacationModeActive").notNull().default(0), // 0 or 1 for boolean
  vacationModeStartDate: varchar("vacationModeStartDate", { length: 10 }),
  
  // Onboarding state
  hasCompletedOnboarding: int("hasCompletedOnboarding").notNull().default(0), // 0 or 1 for boolean
  selectedFlavor: varchar("selectedFlavor", { length: 20 }).default("gentle"),
  selectedContext: varchar("selectedContext", { length: 20 }).default("nest"),
  selectedTheme: varchar("selectedTheme", { length: 20 }).default("default"),
  
  // Mascot state
  mascotMood: varchar("mascotMood", { length: 20 }).default("neutral"),
  lastPetTime: timestamp("lastPetTime"),
  lastFeedTime: timestamp("lastFeedTime"),
  
  // Purchased items (JSON array of item IDs)
  purchasedItems: json("purchasedItems").$type<string[]>(),
  equippedAccessories: json("equippedAccessories").$type<string[]>(),
  
  // Settings
  soundEnabled: int("soundEnabled").notNull().default(1), // 0 or 1 for boolean
  soundTheme: varchar("soundTheme", { length: 20 }).default("default"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Tasks (both Quick Wins and Boss Battles)
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  title: text("title").notNull(),
  type: mysqlEnum("type", ["quick", "boss"]).notNull(),
  category: varchar("category", { length: 50 }), // work, home, self, family
  durationMinutes: int("durationMinutes").notNull().default(5), // Task duration in minutes
  
  // Boss Battle specific
  subtasks: json("subtasks").$type<Array<{ id: string; text: string; completed: boolean }>>(),
  
  completed: int("completed").notNull().default(0), // 0 or 1 for boolean
  completedAt: timestamp("completedAt"),
  
  // Rewards
  xpReward: int("xpReward").notNull().default(10),
  coinReward: int("coinReward").notNull().default(5),
  
  // Task sequencing (for ordered task chains like mail handling)
  sequenceGroup: varchar("sequenceGroup", { length: 100 }), // e.g., "mail-handling"
  sequenceOrder: int("sequenceOrder"), // 1, 2, 3... for ordering within group
  
  // Decision tree fields for ADHD-informed sequencing
  activationEnergy: mysqlEnum("activationEnergy", ["micro", "easy", "medium", "deep"]).default("easy"),
  recommendedState: varchar("recommendedState", { length: 50 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Journal entries (completed task history)
 */
export const journalEntries = mysqlTable("journalEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  taskTitle: text("taskTitle").notNull(),
  taskType: varchar("taskType", { length: 20 }).notNull(),
  xpEarned: int("xpEarned").notNull(),
  coinEarned: int("coinEarned").notNull(),
  
  completedAt: timestamp("completedAt").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD for easy querying
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

/**
 * Daily affirmations shown to users
 */
export const dailyAffirmations = mysqlTable("dailyAffirmations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  message: text("message").notNull(),
  shownDate: varchar("shownDate", { length: 10 }).notNull(), // YYYY-MM-DD
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyAffirmation = typeof dailyAffirmations.$inferSelect;
export type InsertDailyAffirmation = typeof dailyAffirmations.$inferInsert;

/**
 * Habits for daily/recurring activities (medication, exercise, etc.)
 */
export const habits = mysqlTable("habits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  description: text("description"),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "custom"]).default("daily").notNull(),
  targetCount: int("targetCount").default(1).notNull(), // e.g., 3 for "3x daily"
  
  // Streak tracking
  currentStreak: int("currentStreak").notNull().default(0),
  longestStreak: int("longestStreak").notNull().default(0),
  lastCompletedDate: varchar("lastCompletedDate", { length: 10 }), // YYYY-MM-DD
  
  // Status
  isActive: int("isActive").notNull().default(1), // 0 or 1 for boolean
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;

/**
 * Habit completions (daily log of habit completions)
 */
export const habitCompletions = mysqlTable("habitCompletions", {
  id: int("id").autoincrement().primaryKey(),
  habitId: int("habitId").notNull().references(() => habits.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  completedAt: timestamp("completedAt").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = typeof habitCompletions.$inferInsert;

/**
 * Mood and energy tracking entries
 */
export const moodEntries = mysqlTable("moodEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  moodLevel: int("moodLevel").notNull(), // 1-5 scale: 1=Terrible, 5=Amazing
  energyLevel: mysqlEnum("energyLevel", ["low", "medium", "high"]).notNull(),
  notes: text("notes"),
  
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = typeof moodEntries.$inferInsert;

/**
 * Daily user statistics (aggregated data for analytics)
 */
export const userStats = mysqlTable("userStats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  tasksCompleted: int("tasksCompleted").notNull().default(0),
  habitsCompleted: int("habitsCompleted").notNull().default(0),
  currentStreak: int("currentStreak").notNull().default(0),
  
  // Mood averages for the day
  moodAverage: int("moodAverage"), // Average mood level (1-5)
  energyAverage: varchar("energyAverage", { length: 20 }), // Most common energy level
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

/**
 * Leaderboard entries (cached for performance)
 */
export const leaderboardEntries = mysqlTable("leaderboardEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Current stats
  currentStreak: int("currentStreak").notNull().default(0),
  totalTasksCompleted: int("totalTasksCompleted").notNull().default(0),
  totalCoins: int("totalCoins").notNull().default(0),
  
  // Leaderboard rank
  globalRank: int("globalRank"),
  weeklyRank: int("weeklyRank"),
  
  // Last updated
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});

export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertLeaderboardEntry = typeof leaderboardEntries.$inferInsert;

/**
 * Contests and challenges
 */
export const contests = mysqlTable("contests", {
  id: int("id").autoincrement().primaryKey(),
  
  type: mysqlEnum("type", ["weekly", "daily", "community", "friends"]).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  
  // Contest parameters
  target: int("target").notNull(),
  reward: int("reward").notNull(),
  
  // Timing
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  
  // Status
  active: int("active").notNull().default(1),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Contest = typeof contests.$inferSelect;
export type InsertContest = typeof contests.$inferInsert;

/**
 * User contest participation and progress
 */
export const contestParticipation = mysqlTable("contestParticipation", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  contestId: int("contestId").notNull().references(() => contests.id, { onDelete: "cascade" }),
  
  // Progress
  progress: int("progress").notNull().default(0),
  completed: int("completed").notNull().default(0),
  
  // Rewards
  rewardClaimed: int("rewardClaimed").notNull().default(0),
  
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ContestParticipation = typeof contestParticipation.$inferSelect;
export type InsertContestParticipation = typeof contestParticipation.$inferInsert;

/**
 * Digital rewards (stickers, GIFs, badges)
 */
export const rewards = mysqlTable("rewards", {
  id: int("id").autoincrement().primaryKey(),
  
  name: text("name").notNull(),
  description: text("description"),
  emoji: varchar("emoji", { length: 10 }),
  
  // Reward type and rarity
  type: mysqlEnum("type", ["gif", "sticker", "badge"]).notNull(),
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).notNull(),
  
  // Cost in coins
  cost: int("cost").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;

/**
 * User reward collection
 */
export const userRewards = mysqlTable("userRewards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  rewardId: int("rewardId").notNull().references(() => rewards.id, { onDelete: "cascade" }),
  
  // Ownership
  owned: int("owned").notNull().default(1),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type UserReward = typeof userRewards.$inferSelect;
export type InsertUserReward = typeof userRewards.$inferInsert;

/**
 * Daily check-in records
 */
export const dailyCheckIns = mysqlTable("dailyCheckIns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  energyLevel: mysqlEnum("energyLevel", ["low", "medium", "high"]),
  vibe: mysqlEnum("vibe", ["anxious", "bored", "overwhelmed", "energized"]),
  need: mysqlEnum("need", ["quick-wins", "deep-focus", "movement", "rest"]),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyCheckIn = typeof dailyCheckIns.$inferSelect;
export type InsertDailyCheckIn = typeof dailyCheckIns.$inferInsert;


/**
 * Terms of Service versions tracking
 */
export const termsVersions = mysqlTable("termsVersions", {
  id: int("id").autoincrement().primaryKey(),
  version: varchar("version", { length: 20 }).notNull().unique(), // e.g., "1.0", "1.1"
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // Full terms content
  effectiveDate: timestamp("effectiveDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TermsVersion = typeof termsVersions.$inferSelect;
export type InsertTermsVersion = typeof termsVersions.$inferInsert;

/**
 * User terms acceptance tracking
 */
export const userTermsAcceptance = mysqlTable("userTermsAcceptance", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  termsVersionId: int("termsVersionId").notNull().references(() => termsVersions.id, { onDelete: "restrict" }),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
});
export type UserTermsAcceptance = typeof userTermsAcceptance.$inferSelect;
export type InsertUserTermsAcceptance = typeof userTermsAcceptance.$inferInsert;

/**
 * Email verification codes for checkout
 */
export const emailVerificationCodes = mysqlTable("emailVerificationCodes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(), // 6-digit code
  verified: int("verified").notNull().default(0), // 0 or 1 for boolean
  expiresAt: timestamp("expiresAt").notNull(), // Code expires after 10 minutes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type InsertEmailVerificationCode = typeof emailVerificationCodes.$inferInsert;


/**
 * Nervous system states - tracks user's current state for decision tree
 */
export const nervousSystemStates = mysqlTable("nervousSystemStates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Current state
  state: mysqlEnum("state", ["squirrel", "tired", "focused", "hurting"]).notNull(),
  description: text("description"),
  
  // Timestamps
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NervousSystemState = typeof nervousSystemStates.$inferSelect;
export type InsertNervousSystemState = typeof nervousSystemStates.$inferInsert;

/**
 * Decision tree sessions - tracks user's journey through the decision tree
 */
export const decisionTreeSessions = mysqlTable("decisionTreeSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Session data
  timeAvailable: varchar("timeAvailable", { length: 20 }).notNull(),
  userState: varchar("userState", { length: 20 }).notNull(),
  activityPreference: varchar("activityPreference", { length: 50 }),
  
  // Brain dump tasks
  brainDumpTasks: json("brainDumpTasks").$type<string[]>(),
  
  // Sequenced tasks (result of decision tree)
  sequencedTasks: json("sequencedTasks").$type<Array<{ taskId: number; order: number; estimatedDuration: number }>>(),
  
  // Session tracking
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DecisionTreeSession = typeof decisionTreeSessions.$inferSelect;
export type InsertDecisionTreeSession = typeof decisionTreeSessions.$inferInsert;


/**
 * Pick & Win - Gamification feature for character picks and discount codes
 */
export const characterPicks = mysqlTable("characterPicks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Character selection
  character: mysqlEnum("character", ["focused", "energized", "creative", "chill"]).notNull(),
  discountPercent: int("discountPercent").notNull(), // 25, 20, 15, or free trial
  discountCode: varchar("discountCode", { length: 50 }).notNull().unique(),
  
  // Tracking
  pickedAt: timestamp("pickedAt").defaultNow().notNull(),
  usedAt: timestamp("usedAt"), // When user redeemed the code
  expiresAt: timestamp("expiresAt").notNull(), // Expires after 30 days
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CharacterPick = typeof characterPicks.$inferSelect;
export type InsertCharacterPick = typeof characterPicks.$inferInsert;

/**
 * Weekly character picks - tracks when user last picked for weekly bonus
 */
export const weeklyCharacterPicks = mysqlTable("weeklyCharacterPicks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Weekly bonus tracking
  character: mysqlEnum("character", ["focused", "energized", "creative", "chill"]).notNull(),
  bonusCoins: int("bonusCoins").notNull().default(50), // Bonus coins for weekly pick
  
  // Tracking
  pickedAt: timestamp("pickedAt").defaultNow().notNull(),
  weekStartDate: varchar("weekStartDate", { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyCharacterPick = typeof weeklyCharacterPicks.$inferSelect;
export type InsertWeeklyCharacterPick = typeof weeklyCharacterPicks.$inferInsert;


/**
 * User Feedback - Collects bug reports, feature requests, and general feedback
 */
export const feedbacks = mysqlTable("feedbacks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "cascade" }), // Nullable for anonymous feedback
  
  // Feedback details
  type: mysqlEnum("type", ["bug", "feature", "general"]).notNull(),
  message: text("message").notNull(),
  
  // Tracking
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;

/**
 * AI Coach conversation history
 * Stores user messages and coach responses for personalization and analysis
 */
export const coachConversations = mysqlTable("coachConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Conversation context
  nervousSystemState: mysqlEnum("nervousSystemState", ["squirrel", "tired", "focused", "hurting"]).notNull(),
  
  // Message content
  userMessage: text("userMessage").notNull(),
  coachMessage: text("coachMessage").notNull(),
  
  // Suggested technique (if any)
  suggestedTechniqueId: varchar("suggestedTechniqueId", { length: 100 }),
  suggestedTechniqueName: varchar("suggestedTechniqueName", { length: 255 }),
  
  // User feedback on technique
  techniqueHelpfulRating: int("techniqueHelpfulRating"), // 1-5 scale
  techniqueNotes: text("techniqueNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachConversation = typeof coachConversations.$inferSelect;
export type InsertCoachConversation = typeof coachConversations.$inferInsert;

/**
 * Technique effectiveness tracking
 * Helps personalize which techniques are recommended to each user
 */
export const userTechniqueEffectiveness = mysqlTable("userTechniqueEffectiveness", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Technique info
  techniqueId: varchar("techniqueId", { length: 100 }).notNull(),
  techniqueName: varchar("techniqueName", { length: 255 }).notNull(),
  techniqueCategory: mysqlEnum("techniqueCategory", ["grounding", "motivation", "breakdown", "cognitive", "emotion"]).notNull(),
  
  // Effectiveness data
  timesUsed: int("timesUsed").notNull().default(0),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).notNull().default("0"), // 1-5 scale
  totalRatings: int("totalRatings").notNull().default(0),
  
  // Nervous system state effectiveness
  effectiveForSquirrel: int("effectiveForSquirrel").notNull().default(0), // count of positive ratings
  effectiveForTired: int("effectiveForTired").notNull().default(0),
  effectiveForFocused: int("effectiveForFocused").notNull().default(0),
  effectiveForHurting: int("effectiveForHurting").notNull().default(0),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserTechniqueEffectiveness = typeof userTechniqueEffectiveness.$inferSelect;
export type InsertUserTechniqueEffectiveness = typeof userTechniqueEffectiveness.$inferInsert;


/**
 * A/B Test Variants - Track which users are in which experiment group
 * Used to measure coach engagement impact on retention
 */
export const abTestVariants = mysqlTable("abTestVariants", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Coach engagement test
  coachVariant: mysqlEnum("coachVariant", ["control", "treatment"]).notNull().default("control"),
  coachVariantAssignedAt: timestamp("coachVariantAssignedAt").defaultNow().notNull(),
  
  // Retention tracking
  d1Completed: int("d1Completed").notNull().default(0), // 0 or 1
  d7Completed: int("d7Completed").notNull().default(0),
  d30Completed: int("d30Completed").notNull().default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ABTestVariant = typeof abTestVariants.$inferSelect;
export type InsertABTestVariant = typeof abTestVariants.$inferInsert;

/**
 * Retention Metrics - Track daily active users and retention cohorts
 */
export const retentionMetrics = mysqlTable("retentionMetrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Cohort info
  cohortDate: varchar("cohortDate", { length: 10 }).notNull(), // YYYY-MM-DD of user signup
  
  // Activity tracking
  lastActiveDate: varchar("lastActiveDate", { length: 10 }).notNull(), // YYYY-MM-DD
  daysSinceSignup: int("daysSinceSignup").notNull(), // 0 = D0, 1 = D1, etc.
  tasksCompletedOnDay: int("tasksCompletedOnDay").notNull().default(0),
  
  // Engagement metrics
  usedBrainCheck: int("usedBrainCheck").notNull().default(0), // 0 or 1
  usedCoach: int("usedCoach").notNull().default(0), // 0 or 1
  usedFocusMode: int("usedFocusMode").notNull().default(0), // 0 or 1
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RetentionMetric = typeof retentionMetrics.$inferSelect;
export type InsertRetentionMetric = typeof retentionMetrics.$inferInsert;

/**
 * Technique Ratings - Individual ratings for techniques (1-5 stars)
 * Used to train personalization algorithm
 */
export const techniqueRatings = mysqlTable("techniqueRatings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Technique info
  techniqueId: varchar("techniqueId", { length: 100 }).notNull(),
  techniqueName: varchar("techniqueName", { length: 255 }).notNull(),
  
  // Context
  nervousSystemState: mysqlEnum("nervousSystemState", ["squirrel", "tired", "focused", "hurting"]).notNull(),
  
  // Rating
  rating: int("rating").notNull(), // 1-5 stars
  feedback: text("feedback"), // Optional user comment
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TechniqueRating = typeof techniqueRatings.$inferSelect;
export type InsertTechniqueRating = typeof techniqueRatings.$inferInsert;


/**
 * Payment History - Track all coin purchases
 */
export const coinPurchases = mysqlTable("coinPurchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Purchase details
  packageId: varchar("packageId", { length: 50 }).notNull(), // "starter", "boost", "pro", "elite"
  coinsAmount: int("coinsAmount").notNull(), // Total coins including bonus
  priceInCents: int("priceInCents").notNull(), // Price in cents
  
  // Stripe tracking
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  
  // Payment status
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).notNull().default("pending"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"), // When payment was confirmed
});

export type CoinPurchase = typeof coinPurchases.$inferSelect;
export type InsertCoinPurchase = typeof coinPurchases.$inferInsert;

/**
 * Referral System - Track user referrals and bonus coins
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredUserId: int("referredUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Referral code
  referralCode: varchar("referralCode", { length: 50 }).notNull().unique(),
  
  // Bonus tracking
  bonusCoinsAwarded: int("bonusCoinsAwarded").notNull().default(0),
  referrerBonusCoins: int("referrerBonusCoins").notNull().default(50), // Bonus for referrer
  referredBonusCoins: int("referredBonusCoins").notNull().default(25), // Bonus for referred user
  
  // Status
  isActive: int("isActive").notNull().default(1), // 0 or 1
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  claimedAt: timestamp("claimedAt"), // When referred user signed up
  bonusAwardedAt: timestamp("bonusAwardedAt"), // When bonus was given
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;


/**
 * User subscriptions - tracks active subscriptions
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Subscription details
  tier: mysqlEnum("tier", ["free", "premium"]).notNull().default("free"),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  
  // Billing
  status: mysqlEnum("status", ["active", "paused", "canceled"]).notNull().default("active"),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  canceledAt: timestamp("canceledAt"),
  
  // Premium features
  autoDashEnabled: int("autoDashEnabled").notNull().default(0),
  lowEnergyModeEnabled: int("lowEnergyModeEnabled").notNull().default(0),
  streakForgivenessEnabled: int("streakForgivenessEnabled").notNull().default(0),
  rewardCustomizationEnabled: int("rewardCustomizationEnabled").notNull().default(0),
  gentleInsightsEnabled: int("gentleInsightsEnabled").notNull().default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Premium feature preferences - user customization for premium features
 */
export const premiumPreferences = mysqlTable("premiumPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Low-Energy Mode settings
  lowEnergyTaskLength: int("lowEnergyTaskLength").notNull().default(5), // minutes
  lowEnergyLanguageTone: mysqlEnum("lowEnergyLanguageTone", ["gentle", "supportive", "celebratory"]).notNull().default("gentle"),
  
  // Reward customization
  affirmationTone: mysqlEnum("affirmationTone", ["gentle", "enthusiastic", "playful"]).notNull().default("gentle"),
  feedbackIntensity: mysqlEnum("feedbackIntensity", ["minimal", "moderate", "full"]).notNull().default("moderate"),
  soundEnabled: int("soundEnabled").notNull().default(1),
  
  // Streak Forgiveness
  streakForgivenessUsesRemaining: int("streakForgivenessUsesRemaining").notNull().default(3), // 3 per month
  lastStreakForgiveness: timestamp("lastStreakForgiveness"),
  
  // Gentle Insights preferences
  showProductivityMetrics: int("showProductivityMetrics").notNull().default(0), // 0 = off, 1 = on
  showMoodPatterns: int("showMoodPatterns").notNull().default(1),
  showEnergyPatterns: int("showEnergyPatterns").notNull().default(1),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PremiumPreferences = typeof premiumPreferences.$inferSelect;
export type InsertPremiumPreferences = typeof premiumPreferences.$inferInsert;

/**
 * Auto-Dash suggestions - AI-generated task suggestions for premium users
 */
export const autoDashSuggestions = mysqlTable("autoDashSuggestions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Suggestion details
  suggestedTaskId: int("suggestedTaskId").references(() => tasks.id, { onDelete: "set null" }),
  suggestedTaskTitle: text("suggestedTaskTitle"),
  suggestedTaskDescription: text("suggestedTaskDescription"),
  
  // Context
  energyLevel: mysqlEnum("energyLevel", ["low", "medium", "high"]),
  moodLevel: int("moodLevel"), // 1-5
  timeAvailable: varchar("timeAvailable", { length: 20 }), // "2min", "5min", "15min"
  
  // Interaction
  accepted: int("accepted").notNull().default(0),
  rejected: int("rejected").notNull().default(0),
  completed: int("completed").notNull().default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // Suggestion expires after 1 hour
});

export type AutoDashSuggestion = typeof autoDashSuggestions.$inferSelect;
export type InsertAutoDashSuggestion = typeof autoDashSuggestions.$inferInsert;

/**
 * Contextual upsell prompts - tracks when/where to show premium upsells
 */
export const upsellPrompts = mysqlTable("upsellPrompts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Trigger context
  triggerType: mysqlEnum("triggerType", ["decision_fatigue", "low_energy", "streak_broken", "no_progress", "stuck_task"]).notNull(),
  triggerDescription: text("triggerDescription"),
  
  // Prompt interaction
  shown: int("shown").notNull().default(0),
  clicked: int("clicked").notNull().default(0),
  dismissed: int("dismissed").notNull().default(0),
  
  // Feature promoted
  featurePromoted: mysqlEnum("featurePromoted", ["auto_dash", "low_energy_mode", "streak_forgiveness", "reward_customization", "gentle_insights"]).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UpsellPrompt = typeof upsellPrompts.$inferSelect;
export type InsertUpsellPrompt = typeof upsellPrompts.$inferInsert;


/**
 * Analytics events - tracks user actions for analytics dashboard
 */
export const analyticsEvents = mysqlTable("analyticsEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Event type
  eventType: mysqlEnum("eventType", [
    "signup",
    "onboarding_complete",
    "first_task_complete",
    "task_complete",
    "streak_milestone",
    "premium_upgrade",
    "notification_sent",
    "notification_clicked",
    "session_start",
    "session_end"
  ]).notNull(),
  
  // Event metadata
  metadata: json("metadata").$type<Record<string, any>>(),
  
  // Timestamps
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

/**
 * Push notification A/B tests - tracks notification variants and engagement
 */
export const notificationABTests = mysqlTable("notificationABTests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Test variant assignment
  testId: varchar("testId", { length: 100 }).notNull(), // e.g., "reminder_messaging_v1"
  variant: mysqlEnum("variant", ["control", "variant_a", "variant_b"]).notNull(),
  
  // Notification details
  message: text("message").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  
  // Engagement tracking
  delivered: int("delivered").notNull().default(0),
  clicked: int("clicked").notNull().default(0),
  dismissed: int("dismissed").notNull().default(0),
  clickedAt: timestamp("clickedAt"),
  
  // Outcome
  taskCompletedAfter: int("taskCompletedAfter").notNull().default(0), // 0 or 1
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NotificationABTest = typeof notificationABTests.$inferSelect;
export type InsertNotificationABTest = typeof notificationABTests.$inferInsert;

/**
 * Streak milestones - tracks when users hit 7-day, 30-day, 100-day streaks
 */
export const streakMilestones = mysqlTable("streakMilestones", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Milestone details
  streakDays: int("streakDays").notNull(), // 7, 30, 100, etc.
  milestoneType: mysqlEnum("milestoneType", ["seven_day", "thirty_day", "hundred_day", "custom"]).notNull(),
  
  // Achievement details
  achievedAt: timestamp("achievedAt").notNull(),
  celebrationShown: int("celebrationShown").notNull().default(0), // 0 or 1
  shared: int("shared").notNull().default(0), // 0 or 1
  
  // Badge/reward
  badgeEarned: varchar("badgeEarned", { length: 100 }), // e.g., "streak_7_day"
  coinReward: int("coinReward").notNull().default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StreakMilestone = typeof streakMilestones.$inferSelect;
export type InsertStreakMilestone = typeof streakMilestones.$inferInsert;
