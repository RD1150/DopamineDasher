var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  abTestVariants: () => abTestVariants,
  autoDashSuggestions: () => autoDashSuggestions,
  characterPicks: () => characterPicks,
  coachConversations: () => coachConversations,
  coinPurchases: () => coinPurchases,
  contestParticipation: () => contestParticipation,
  contests: () => contests,
  dailyAffirmations: () => dailyAffirmations,
  dailyCheckIns: () => dailyCheckIns,
  decisionTreeSessions: () => decisionTreeSessions,
  emailVerificationCodes: () => emailVerificationCodes,
  feedbacks: () => feedbacks,
  habitCompletions: () => habitCompletions,
  habits: () => habits,
  journalEntries: () => journalEntries,
  leaderboardEntries: () => leaderboardEntries,
  moodEntries: () => moodEntries,
  nervousSystemStates: () => nervousSystemStates,
  premiumPreferences: () => premiumPreferences,
  referrals: () => referrals,
  retentionMetrics: () => retentionMetrics,
  rewards: () => rewards,
  subscriptions: () => subscriptions,
  tasks: () => tasks,
  techniqueRatings: () => techniqueRatings,
  termsVersions: () => termsVersions,
  upsellPrompts: () => upsellPrompts,
  userProfiles: () => userProfiles,
  userRewards: () => userRewards,
  userStats: () => userStats,
  userTechniqueEffectiveness: () => userTechniqueEffectiveness,
  userTermsAcceptance: () => userTermsAcceptance,
  users: () => users,
  weeklyCharacterPicks: () => weeklyCharacterPicks
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal } from "drizzle-orm/mysql-core";
var users, userProfiles, tasks, journalEntries, dailyAffirmations, habits, habitCompletions, moodEntries, userStats, leaderboardEntries, contests, contestParticipation, rewards, userRewards, dailyCheckIns, termsVersions, userTermsAcceptance, emailVerificationCodes, nervousSystemStates, decisionTreeSessions, characterPicks, weeklyCharacterPicks, feedbacks, coachConversations, userTechniqueEffectiveness, abTestVariants, retentionMetrics, techniqueRatings, coinPurchases, referrals, subscriptions, premiumPreferences, autoDashSuggestions, upsellPrompts;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
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
      isPremium: int("isPremium").notNull().default(0),
      // 0 or 1 for boolean
      stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    userProfiles = mysqlTable("userProfiles", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Game progression
      xp: int("xp").notNull().default(0),
      level: int("level").notNull().default(1),
      coins: int("coins").notNull().default(0),
      // Streak tracking
      currentStreak: int("currentStreak").notNull().default(0),
      longestStreak: int("longestStreak").notNull().default(0),
      lastActiveDate: varchar("lastActiveDate", { length: 10 }),
      // YYYY-MM-DD format
      vacationModeActive: int("vacationModeActive").notNull().default(0),
      // 0 or 1 for boolean
      vacationModeStartDate: varchar("vacationModeStartDate", { length: 10 }),
      // Onboarding state
      hasCompletedOnboarding: int("hasCompletedOnboarding").notNull().default(0),
      // 0 or 1 for boolean
      selectedFlavor: varchar("selectedFlavor", { length: 20 }).default("gentle"),
      selectedContext: varchar("selectedContext", { length: 20 }).default("nest"),
      selectedTheme: varchar("selectedTheme", { length: 20 }).default("default"),
      // Mascot state
      mascotMood: varchar("mascotMood", { length: 20 }).default("neutral"),
      lastPetTime: timestamp("lastPetTime"),
      lastFeedTime: timestamp("lastFeedTime"),
      // Purchased items (JSON array of item IDs)
      purchasedItems: json("purchasedItems").$type(),
      equippedAccessories: json("equippedAccessories").$type(),
      // Settings
      soundEnabled: int("soundEnabled").notNull().default(1),
      // 0 or 1 for boolean
      soundTheme: varchar("soundTheme", { length: 20 }).default("default"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    tasks = mysqlTable("tasks", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      title: text("title").notNull(),
      type: mysqlEnum("type", ["quick", "boss"]).notNull(),
      category: varchar("category", { length: 50 }),
      // work, home, self, family
      durationMinutes: int("durationMinutes").notNull().default(5),
      // Task duration in minutes
      // Boss Battle specific
      subtasks: json("subtasks").$type(),
      completed: int("completed").notNull().default(0),
      // 0 or 1 for boolean
      completedAt: timestamp("completedAt"),
      // Rewards
      xpReward: int("xpReward").notNull().default(10),
      coinReward: int("coinReward").notNull().default(5),
      // Task sequencing (for ordered task chains like mail handling)
      sequenceGroup: varchar("sequenceGroup", { length: 100 }),
      // e.g., "mail-handling"
      sequenceOrder: int("sequenceOrder"),
      // 1, 2, 3... for ordering within group
      // Decision tree fields for ADHD-informed sequencing
      activationEnergy: mysqlEnum("activationEnergy", ["micro", "easy", "medium", "deep"]).default("easy"),
      recommendedState: varchar("recommendedState", { length: 50 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    journalEntries = mysqlTable("journalEntries", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      taskTitle: text("taskTitle").notNull(),
      taskType: varchar("taskType", { length: 20 }).notNull(),
      xpEarned: int("xpEarned").notNull(),
      coinEarned: int("coinEarned").notNull(),
      completedAt: timestamp("completedAt").notNull(),
      date: varchar("date", { length: 10 }).notNull(),
      // YYYY-MM-DD for easy querying
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    dailyAffirmations = mysqlTable("dailyAffirmations", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      message: text("message").notNull(),
      shownDate: varchar("shownDate", { length: 10 }).notNull(),
      // YYYY-MM-DD
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    habits = mysqlTable("habits", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      description: text("description"),
      frequency: mysqlEnum("frequency", ["daily", "weekly", "custom"]).default("daily").notNull(),
      targetCount: int("targetCount").default(1).notNull(),
      // e.g., 3 for "3x daily"
      // Streak tracking
      currentStreak: int("currentStreak").notNull().default(0),
      longestStreak: int("longestStreak").notNull().default(0),
      lastCompletedDate: varchar("lastCompletedDate", { length: 10 }),
      // YYYY-MM-DD
      // Status
      isActive: int("isActive").notNull().default(1),
      // 0 or 1 for boolean
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    habitCompletions = mysqlTable("habitCompletions", {
      id: int("id").autoincrement().primaryKey(),
      habitId: int("habitId").notNull().references(() => habits.id, { onDelete: "cascade" }),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      completedAt: timestamp("completedAt").notNull(),
      date: varchar("date", { length: 10 }).notNull(),
      // YYYY-MM-DD
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    moodEntries = mysqlTable("moodEntries", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      moodLevel: int("moodLevel").notNull(),
      // 1-5 scale: 1=Terrible, 5=Amazing
      energyLevel: mysqlEnum("energyLevel", ["low", "medium", "high"]).notNull(),
      notes: text("notes"),
      date: varchar("date", { length: 10 }).notNull(),
      // YYYY-MM-DD
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    userStats = mysqlTable("userStats", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      date: varchar("date", { length: 10 }).notNull(),
      // YYYY-MM-DD
      tasksCompleted: int("tasksCompleted").notNull().default(0),
      habitsCompleted: int("habitsCompleted").notNull().default(0),
      currentStreak: int("currentStreak").notNull().default(0),
      // Mood averages for the day
      moodAverage: int("moodAverage"),
      // Average mood level (1-5)
      energyAverage: varchar("energyAverage", { length: 20 }),
      // Most common energy level
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    leaderboardEntries = mysqlTable("leaderboardEntries", {
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
      lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull()
    });
    contests = mysqlTable("contests", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    contestParticipation = mysqlTable("contestParticipation", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      contestId: int("contestId").notNull().references(() => contests.id, { onDelete: "cascade" }),
      // Progress
      progress: int("progress").notNull().default(0),
      completed: int("completed").notNull().default(0),
      // Rewards
      rewardClaimed: int("rewardClaimed").notNull().default(0),
      joinedAt: timestamp("joinedAt").defaultNow().notNull(),
      completedAt: timestamp("completedAt")
    });
    rewards = mysqlTable("rewards", {
      id: int("id").autoincrement().primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      emoji: varchar("emoji", { length: 10 }),
      // Reward type and rarity
      type: mysqlEnum("type", ["gif", "sticker", "badge"]).notNull(),
      rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).notNull(),
      // Cost in coins
      cost: int("cost").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    userRewards = mysqlTable("userRewards", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      rewardId: int("rewardId").notNull().references(() => rewards.id, { onDelete: "cascade" }),
      // Ownership
      owned: int("owned").notNull().default(1),
      unlockedAt: timestamp("unlockedAt").defaultNow().notNull()
    });
    dailyCheckIns = mysqlTable("dailyCheckIns", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      date: varchar("date", { length: 10 }).notNull(),
      // YYYY-MM-DD
      energyLevel: mysqlEnum("energyLevel", ["low", "medium", "high"]),
      vibe: mysqlEnum("vibe", ["anxious", "bored", "overwhelmed", "energized"]),
      need: mysqlEnum("need", ["quick-wins", "deep-focus", "movement", "rest"]),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    termsVersions = mysqlTable("termsVersions", {
      id: int("id").autoincrement().primaryKey(),
      version: varchar("version", { length: 20 }).notNull().unique(),
      // e.g., "1.0", "1.1"
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content").notNull(),
      // Full terms content
      effectiveDate: timestamp("effectiveDate").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    userTermsAcceptance = mysqlTable("userTermsAcceptance", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      termsVersionId: int("termsVersionId").notNull().references(() => termsVersions.id, { onDelete: "restrict" }),
      acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
      ipAddress: varchar("ipAddress", { length: 45 })
      // IPv4 or IPv6
    });
    emailVerificationCodes = mysqlTable("emailVerificationCodes", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      email: varchar("email", { length: 320 }).notNull(),
      code: varchar("code", { length: 6 }).notNull(),
      // 6-digit code
      verified: int("verified").notNull().default(0),
      // 0 or 1 for boolean
      expiresAt: timestamp("expiresAt").notNull(),
      // Code expires after 10 minutes
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    nervousSystemStates = mysqlTable("nervousSystemStates", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Current state
      state: mysqlEnum("state", ["squirrel", "tired", "focused", "hurting"]).notNull(),
      description: text("description"),
      // Timestamps
      recordedAt: timestamp("recordedAt").defaultNow().notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    decisionTreeSessions = mysqlTable("decisionTreeSessions", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Session data
      timeAvailable: varchar("timeAvailable", { length: 20 }).notNull(),
      userState: varchar("userState", { length: 20 }).notNull(),
      activityPreference: varchar("activityPreference", { length: 50 }),
      // Brain dump tasks
      brainDumpTasks: json("brainDumpTasks").$type(),
      // Sequenced tasks (result of decision tree)
      sequencedTasks: json("sequencedTasks").$type(),
      // Session tracking
      completedAt: timestamp("completedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    characterPicks = mysqlTable("characterPicks", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Character selection
      character: mysqlEnum("character", ["focused", "energized", "creative", "chill"]).notNull(),
      discountPercent: int("discountPercent").notNull(),
      // 25, 20, 15, or free trial
      discountCode: varchar("discountCode", { length: 50 }).notNull().unique(),
      // Tracking
      pickedAt: timestamp("pickedAt").defaultNow().notNull(),
      usedAt: timestamp("usedAt"),
      // When user redeemed the code
      expiresAt: timestamp("expiresAt").notNull(),
      // Expires after 30 days
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    weeklyCharacterPicks = mysqlTable("weeklyCharacterPicks", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Weekly bonus tracking
      character: mysqlEnum("character", ["focused", "energized", "creative", "chill"]).notNull(),
      bonusCoins: int("bonusCoins").notNull().default(50),
      // Bonus coins for weekly pick
      // Tracking
      pickedAt: timestamp("pickedAt").defaultNow().notNull(),
      weekStartDate: varchar("weekStartDate", { length: 10 }).notNull(),
      // YYYY-MM-DD
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    feedbacks = mysqlTable("feedbacks", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").references(() => users.id, { onDelete: "cascade" }),
      // Nullable for anonymous feedback
      // Feedback details
      type: mysqlEnum("type", ["bug", "feature", "general"]).notNull(),
      message: text("message").notNull(),
      // Tracking
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    coachConversations = mysqlTable("coachConversations", {
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
      techniqueHelpfulRating: int("techniqueHelpfulRating"),
      // 1-5 scale
      techniqueNotes: text("techniqueNotes"),
      // Timestamps
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    userTechniqueEffectiveness = mysqlTable("userTechniqueEffectiveness", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Technique info
      techniqueId: varchar("techniqueId", { length: 100 }).notNull(),
      techniqueName: varchar("techniqueName", { length: 255 }).notNull(),
      techniqueCategory: mysqlEnum("techniqueCategory", ["grounding", "motivation", "breakdown", "cognitive", "emotion"]).notNull(),
      // Effectiveness data
      timesUsed: int("timesUsed").notNull().default(0),
      averageRating: decimal("averageRating", { precision: 3, scale: 2 }).notNull().default("0"),
      // 1-5 scale
      totalRatings: int("totalRatings").notNull().default(0),
      // Nervous system state effectiveness
      effectiveForSquirrel: int("effectiveForSquirrel").notNull().default(0),
      // count of positive ratings
      effectiveForTired: int("effectiveForTired").notNull().default(0),
      effectiveForFocused: int("effectiveForFocused").notNull().default(0),
      effectiveForHurting: int("effectiveForHurting").notNull().default(0),
      // Timestamps
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    abTestVariants = mysqlTable("abTestVariants", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
      // Coach engagement test
      coachVariant: mysqlEnum("coachVariant", ["control", "treatment"]).notNull().default("control"),
      coachVariantAssignedAt: timestamp("coachVariantAssignedAt").defaultNow().notNull(),
      // Retention tracking
      d1Completed: int("d1Completed").notNull().default(0),
      // 0 or 1
      d7Completed: int("d7Completed").notNull().default(0),
      d30Completed: int("d30Completed").notNull().default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    retentionMetrics = mysqlTable("retentionMetrics", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Cohort info
      cohortDate: varchar("cohortDate", { length: 10 }).notNull(),
      // YYYY-MM-DD of user signup
      // Activity tracking
      lastActiveDate: varchar("lastActiveDate", { length: 10 }).notNull(),
      // YYYY-MM-DD
      daysSinceSignup: int("daysSinceSignup").notNull(),
      // 0 = D0, 1 = D1, etc.
      tasksCompletedOnDay: int("tasksCompletedOnDay").notNull().default(0),
      // Engagement metrics
      usedBrainCheck: int("usedBrainCheck").notNull().default(0),
      // 0 or 1
      usedCoach: int("usedCoach").notNull().default(0),
      // 0 or 1
      usedFocusMode: int("usedFocusMode").notNull().default(0),
      // 0 or 1
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    techniqueRatings = mysqlTable("techniqueRatings", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Technique info
      techniqueId: varchar("techniqueId", { length: 100 }).notNull(),
      techniqueName: varchar("techniqueName", { length: 255 }).notNull(),
      // Context
      nervousSystemState: mysqlEnum("nervousSystemState", ["squirrel", "tired", "focused", "hurting"]).notNull(),
      // Rating
      rating: int("rating").notNull(),
      // 1-5 stars
      feedback: text("feedback"),
      // Optional user comment
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    coinPurchases = mysqlTable("coinPurchases", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Purchase details
      packageId: varchar("packageId", { length: 50 }).notNull(),
      // "starter", "boost", "pro", "elite"
      coinsAmount: int("coinsAmount").notNull(),
      // Total coins including bonus
      priceInCents: int("priceInCents").notNull(),
      // Price in cents
      // Stripe tracking
      stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
      stripeSessionId: varchar("stripeSessionId", { length: 255 }),
      // Payment status
      status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).notNull().default("pending"),
      // Timestamps
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      completedAt: timestamp("completedAt")
      // When payment was confirmed
    });
    referrals = mysqlTable("referrals", {
      id: int("id").autoincrement().primaryKey(),
      referrerId: int("referrerId").notNull().references(() => users.id, { onDelete: "cascade" }),
      referredUserId: int("referredUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Referral code
      referralCode: varchar("referralCode", { length: 50 }).notNull().unique(),
      // Bonus tracking
      bonusCoinsAwarded: int("bonusCoinsAwarded").notNull().default(0),
      referrerBonusCoins: int("referrerBonusCoins").notNull().default(50),
      // Bonus for referrer
      referredBonusCoins: int("referredBonusCoins").notNull().default(25),
      // Bonus for referred user
      // Status
      isActive: int("isActive").notNull().default(1),
      // 0 or 1
      // Timestamps
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      claimedAt: timestamp("claimedAt"),
      // When referred user signed up
      bonusAwardedAt: timestamp("bonusAwardedAt")
      // When bonus was given
    });
    subscriptions = mysqlTable("subscriptions", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    premiumPreferences = mysqlTable("premiumPreferences", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Low-Energy Mode settings
      lowEnergyTaskLength: int("lowEnergyTaskLength").notNull().default(5),
      // minutes
      lowEnergyLanguageTone: mysqlEnum("lowEnergyLanguageTone", ["gentle", "supportive", "celebratory"]).notNull().default("gentle"),
      // Reward customization
      affirmationTone: mysqlEnum("affirmationTone", ["gentle", "enthusiastic", "playful"]).notNull().default("gentle"),
      feedbackIntensity: mysqlEnum("feedbackIntensity", ["minimal", "moderate", "full"]).notNull().default("moderate"),
      soundEnabled: int("soundEnabled").notNull().default(1),
      // Streak Forgiveness
      streakForgivenessUsesRemaining: int("streakForgivenessUsesRemaining").notNull().default(3),
      // 3 per month
      lastStreakForgiveness: timestamp("lastStreakForgiveness"),
      // Gentle Insights preferences
      showProductivityMetrics: int("showProductivityMetrics").notNull().default(0),
      // 0 = off, 1 = on
      showMoodPatterns: int("showMoodPatterns").notNull().default(1),
      showEnergyPatterns: int("showEnergyPatterns").notNull().default(1),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    autoDashSuggestions = mysqlTable("autoDashSuggestions", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Suggestion details
      suggestedTaskId: int("suggestedTaskId").references(() => tasks.id, { onDelete: "set null" }),
      suggestedTaskTitle: text("suggestedTaskTitle"),
      suggestedTaskDescription: text("suggestedTaskDescription"),
      // Context
      energyLevel: mysqlEnum("energyLevel", ["low", "medium", "high"]),
      moodLevel: int("moodLevel"),
      // 1-5
      timeAvailable: varchar("timeAvailable", { length: 20 }),
      // "2min", "5min", "15min"
      // Interaction
      accepted: int("accepted").notNull().default(0),
      rejected: int("rejected").notNull().default(0),
      completed: int("completed").notNull().default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      expiresAt: timestamp("expiresAt")
      // Suggestion expires after 1 hour
    });
    upsellPrompts = mysqlTable("upsellPrompts", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  addCoinsToUser: () => addCoinsToUser,
  awardReferralBonus: () => awardReferralBonus,
  completeHabit: () => completeHabit,
  createCharacterPick: () => createCharacterPick,
  createCoinPurchase: () => createCoinPurchase,
  createContest: () => createContest,
  createDailyAffirmation: () => createDailyAffirmation,
  createDailyCheckIn: () => createDailyCheckIn,
  createDecisionTreeSession: () => createDecisionTreeSession,
  createEmailVerificationCode: () => createEmailVerificationCode,
  createHabit: () => createHabit,
  createJournalEntry: () => createJournalEntry,
  createMoodEntry: () => createMoodEntry,
  createReferralCode: () => createReferralCode,
  createTask: () => createTask,
  createTermsVersion: () => createTermsVersion,
  createUserProfile: () => createUserProfile,
  createWeeklyCharacterPick: () => createWeeklyCharacterPick,
  deleteHabit: () => deleteHabit,
  deleteTask: () => deleteTask,
  getActiveContests: () => getActiveContests,
  getAllFeedback: () => getAllFeedback,
  getAllRewards: () => getAllRewards,
  getCharacterPickHistory: () => getCharacterPickHistory,
  getCheckInHistory: () => getCheckInHistory,
  getCoachConversationHistory: () => getCoachConversationHistory,
  getContestLeaderboard: () => getContestLeaderboard,
  getDb: () => getDb,
  getDecisionTreeSession: () => getDecisionTreeSession,
  getEffectiveTechniquesForUser: () => getEffectiveTechniquesForUser,
  getFeedbackStats: () => getFeedbackStats,
  getGlobalLeaderboard: () => getGlobalLeaderboard,
  getHabitCompletions: () => getHabitCompletions,
  getLatestNervousSystemState: () => getLatestNervousSystemState,
  getLatestTermsVersion: () => getLatestTermsVersion,
  getLatestVerifiedEmail: () => getLatestVerifiedEmail,
  getMoodHistory: () => getMoodHistory,
  getReferralByCode: () => getReferralByCode,
  getRetentionCohort: () => getRetentionCohort,
  getStatsHistory: () => getStatsHistory,
  getTasksByActivationEnergy: () => getTasksByActivationEnergy,
  getTasksBySequenceGroup: () => getTasksBySequenceGroup,
  getTasksByState: () => getTasksByState,
  getTermsVersionById: () => getTermsVersionById,
  getTodayAffirmation: () => getTodayAffirmation,
  getTodayCheckIn: () => getTodayCheckIn,
  getTodayMoodEntry: () => getTodayMoodEntry,
  getUserByOpenId: () => getUserByOpenId,
  getUserCoins: () => getUserCoins,
  getUserContestProgress: () => getUserContestProgress,
  getUserHabits: () => getUserHabits,
  getUserJournalEntries: () => getUserJournalEntries,
  getUserLatestTermsAcceptance: () => getUserLatestTermsAcceptance,
  getUserLeaderboardRank: () => getUserLeaderboardRank,
  getUserPaymentHistory: () => getUserPaymentHistory,
  getUserProfile: () => getUserProfile,
  getUserReferralStats: () => getUserReferralStats,
  getUserRetentionMetrics: () => getUserRetentionMetrics,
  getUserRewards: () => getUserRewards,
  getUserStats: () => getUserStats,
  getUserTasks: () => getUserTasks,
  getWeeklyCharacterPick: () => getWeeklyCharacterPick,
  hasUserAcceptedTermsVersion: () => hasUserAcceptedTermsVersion,
  purchaseReward: () => purchaseReward,
  recordNervousSystemState: () => recordNervousSystemState,
  recordTechniqueFeedback: () => recordTechniqueFeedback,
  recordTermsAcceptance: () => recordTermsAcceptance,
  recordUserSession: () => recordUserSession,
  storeCoachConversation: () => storeCoachConversation,
  submitFeedback: () => submitFeedback,
  updateCoinPurchaseStatus: () => updateCoinPurchaseStatus,
  updateContestProgress: () => updateContestProgress,
  updateHabit: () => updateHabit,
  updateLeaderboardEntry: () => updateLeaderboardEntry,
  updateTask: () => updateTask,
  updateTechniqueEffectiveness: () => updateTechniqueEffectiveness,
  updateUserProfile: () => updateUserProfile,
  updateUserStats: () => updateUserStats,
  upsertUser: () => upsertUser,
  verifyEmailCode: () => verifyEmailCode
});
import { eq, and, desc, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserProfile(userId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createUserProfile(profile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userProfiles).values(profile);
}
async function updateUserProfile(userId, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userProfiles).set(updates).where(eq(userProfiles.userId, userId));
}
async function getUserTasks(userId, completed) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(tasks.userId, userId)];
  if (completed !== void 0) {
    conditions.push(eq(tasks.completed, completed ? 1 : 0));
  }
  return await db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt));
}
async function createTask(task) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values(task);
  return result;
}
async function updateTask(taskId, userId, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(updates).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}
async function deleteTask(taskId, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}
async function getUserJournalEntries(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.completedAt));
}
async function createJournalEntry(entry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(journalEntries).values(entry);
}
async function getTodayAffirmation(userId, date) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(dailyAffirmations).where(and(eq(dailyAffirmations.userId, userId), eq(dailyAffirmations.shownDate, date))).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createDailyAffirmation(affirmation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(dailyAffirmations).values(affirmation);
}
async function getUserHabits(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(habits).where(and(eq(habits.userId, userId), eq(habits.isActive, 1))).orderBy(desc(habits.createdAt));
}
async function createHabit(habit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(habits).values(habit);
  return result;
}
async function updateHabit(habitId, userId, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(habits).set(updates).where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
}
async function deleteHabit(habitId, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(habits).set({ isActive: 0 }).where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
}
async function getHabitCompletions(habitId, userId, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const startDate = /* @__PURE__ */ new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];
  return await db.select().from(habitCompletions).where(and(
    eq(habitCompletions.habitId, habitId),
    eq(habitCompletions.userId, userId),
    gte(habitCompletions.date, startDateStr)
  )).orderBy(desc(habitCompletions.date));
}
async function completeHabit(habitId, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const existing = await db.select().from(habitCompletions).where(and(
    eq(habitCompletions.habitId, habitId),
    eq(habitCompletions.userId, userId),
    eq(habitCompletions.date, today)
  )).limit(1);
  if (existing.length > 0) {
    return { alreadyCompleted: true };
  }
  await db.insert(habitCompletions).values({
    habitId,
    userId,
    completedAt: /* @__PURE__ */ new Date(),
    date: today
  });
  const habit = await db.select().from(habits).where(eq(habits.id, habitId)).limit(1);
  if (habit.length > 0) {
    const h = habit[0];
    const newStreak = (h.currentStreak || 0) + 1;
    const longestStreak = Math.max(newStreak, h.longestStreak || 0);
    await db.update(habits).set({
      currentStreak: newStreak,
      longestStreak,
      lastCompletedDate: today
    }).where(eq(habits.id, habitId));
  }
  return { success: true };
}
async function createMoodEntry(entry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(moodEntries).values(entry);
}
async function getTodayMoodEntry(userId) {
  const db = await getDb();
  if (!db) return void 0;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const result = await db.select().from(moodEntries).where(and(eq(moodEntries.userId, userId), eq(moodEntries.date, today))).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getMoodHistory(userId, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const startDate = /* @__PURE__ */ new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];
  return await db.select().from(moodEntries).where(and(
    eq(moodEntries.userId, userId),
    gte(moodEntries.date, startDateStr)
  )).orderBy(desc(moodEntries.date));
}
async function getUserStats(userId, date) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(userStats).where(and(eq(userStats.userId, userId), eq(userStats.date, date))).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getStatsHistory(userId, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const startDate = /* @__PURE__ */ new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];
  return await db.select().from(userStats).where(and(
    eq(userStats.userId, userId),
    gte(userStats.date, startDateStr)
  )).orderBy(desc(userStats.date));
}
async function updateUserStats(userId, date, updates) {
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
      ...updates
    });
  }
}
async function getGlobalLeaderboard(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: leaderboardEntries.id,
    userId: leaderboardEntries.userId,
    currentStreak: leaderboardEntries.currentStreak,
    totalTasksCompleted: leaderboardEntries.totalTasksCompleted,
    totalCoins: leaderboardEntries.totalCoins,
    globalRank: leaderboardEntries.globalRank
  }).from(leaderboardEntries).orderBy(desc(leaderboardEntries.totalCoins)).limit(limit);
}
async function updateLeaderboardEntry(userId, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(leaderboardEntries).where(eq(leaderboardEntries.userId, userId)).limit(1);
  if (existing.length > 0) {
    await db.update(leaderboardEntries).set(updates).where(eq(leaderboardEntries.userId, userId));
  } else {
    await db.insert(leaderboardEntries).values({
      userId,
      ...updates
    });
  }
}
async function getUserLeaderboardRank(userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(leaderboardEntries).where(eq(leaderboardEntries.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getActiveContests() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contests).where(eq(contests.active, 1)).orderBy(desc(contests.startDate));
}
async function createContest(contest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contests).values(contest);
  return result;
}
async function getUserContestProgress(userId, contestId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(contestParticipation).where(and(
    eq(contestParticipation.userId, userId),
    eq(contestParticipation.contestId, contestId)
  )).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function updateContestProgress(userId, contestId, progress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserContestProgress(userId, contestId);
  if (existing) {
    await db.update(contestParticipation).set({ progress }).where(and(
      eq(contestParticipation.userId, userId),
      eq(contestParticipation.contestId, contestId)
    ));
  } else {
    await db.insert(contestParticipation).values({
      userId,
      contestId,
      progress
    });
  }
}
async function getContestLeaderboard(contestId, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contestParticipation).where(eq(contestParticipation.contestId, contestId)).orderBy(desc(contestParticipation.progress)).limit(limit);
}
async function getAllRewards() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(rewards).orderBy(desc(rewards.cost));
}
async function getUserRewards(userId) {
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
    unlockedAt: userRewards.unlockedAt
  }).from(userRewards).innerJoin(rewards, eq(userRewards.rewardId, rewards.id)).where(eq(userRewards.userId, userId)).orderBy(desc(userRewards.unlockedAt));
}
async function purchaseReward(userId, rewardId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userRewards).values({
    userId,
    rewardId
  });
}
async function getTodayCheckIn(userId) {
  const db = await getDb();
  if (!db) return null;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const result = await db.select().from(dailyCheckIns).where(and(
    eq(dailyCheckIns.userId, userId),
    eq(dailyCheckIns.date, today)
  )).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function createDailyCheckIn(checkIn) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(dailyCheckIns).values(checkIn);
}
async function getCheckInHistory(userId, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const startDate = /* @__PURE__ */ new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];
  return await db.select().from(dailyCheckIns).where(and(
    eq(dailyCheckIns.userId, userId),
    gte(dailyCheckIns.date, startDateStr)
  )).orderBy(desc(dailyCheckIns.date));
}
async function createEmailVerificationCode(userId, email) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const code = Math.floor(1e5 + Math.random() * 9e5).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
  await db.insert(emailVerificationCodes).values({
    userId,
    email,
    code,
    expiresAt
  });
  return code;
}
async function verifyEmailCode(userId, code) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(emailVerificationCodes).where(and(
    eq(emailVerificationCodes.userId, userId),
    eq(emailVerificationCodes.code, code),
    gte(emailVerificationCodes.expiresAt, /* @__PURE__ */ new Date())
  )).limit(1);
  if (result.length === 0) return false;
  await db.update(emailVerificationCodes).set({ verified: 1 }).where(eq(emailVerificationCodes.id, result[0].id));
  return true;
}
async function getLatestVerifiedEmail(userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(emailVerificationCodes).where(and(
    eq(emailVerificationCodes.userId, userId),
    eq(emailVerificationCodes.verified, 1)
  )).orderBy(desc(emailVerificationCodes.createdAt)).limit(1);
  return result.length > 0 ? result[0].email : null;
}
async function createTermsVersion(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(termsVersions).values(data);
  return result;
}
async function getLatestTermsVersion() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(termsVersions).orderBy(desc(termsVersions.effectiveDate)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getTermsVersionById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(termsVersions).where(eq(termsVersions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function recordTermsAcceptance(userId, termsVersionId, ipAddress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userTermsAcceptance).values({
    userId,
    termsVersionId,
    ipAddress
  });
}
async function getUserLatestTermsAcceptance(userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userTermsAcceptance).where(eq(userTermsAcceptance.userId, userId)).orderBy(desc(userTermsAcceptance.acceptedAt)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function hasUserAcceptedTermsVersion(userId, termsVersionId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(userTermsAcceptance).where(and(
    eq(userTermsAcceptance.userId, userId),
    eq(userTermsAcceptance.termsVersionId, termsVersionId)
  )).limit(1);
  return result.length > 0;
}
async function recordNervousSystemState(userId, state, description) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(nervousSystemStates).values({
    userId,
    state,
    description,
    recordedAt: /* @__PURE__ */ new Date()
  });
}
async function getLatestNervousSystemState(userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(nervousSystemStates).where(eq(nervousSystemStates.userId, userId)).orderBy(desc(nervousSystemStates.recordedAt)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function createDecisionTreeSession(session) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(decisionTreeSessions).values(session);
  return result;
}
async function getDecisionTreeSession(sessionId, userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(decisionTreeSessions).where(and(
    eq(decisionTreeSessions.id, sessionId),
    eq(decisionTreeSessions.userId, userId)
  )).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getTasksByActivationEnergy(userId, activationEnergy) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tasks).where(and(
    eq(tasks.userId, userId),
    eq(tasks.completed, 0),
    eq(tasks.activationEnergy, activationEnergy)
  )).orderBy(desc(tasks.createdAt));
}
async function getTasksByState(userId, state) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tasks).where(and(
    eq(tasks.userId, userId),
    eq(tasks.completed, 0),
    eq(tasks.recommendedState, state)
  )).orderBy(desc(tasks.createdAt));
}
async function getTasksBySequenceGroup(userId, sequenceGroup) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tasks).where(and(
    eq(tasks.userId, userId),
    eq(tasks.completed, 0),
    eq(tasks.sequenceGroup, sequenceGroup)
  )).orderBy(tasks.sequenceOrder);
}
async function createCharacterPick(pick) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(characterPicks).values(pick);
  return pick;
}
async function getCharacterPickHistory(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(characterPicks).where(eq(characterPicks.userId, userId));
}
async function getWeeklyCharacterPick(userId, weekStartDate) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(weeklyCharacterPicks).where(and(
    eq(weeklyCharacterPicks.userId, userId),
    eq(weeklyCharacterPicks.weekStartDate, weekStartDate)
  )).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function createWeeklyCharacterPick(pick) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(weeklyCharacterPicks).values(pick);
  return pick;
}
async function submitFeedback(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { feedbacks: feedbacks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  await db.insert(feedbacks2).values({
    userId: data.userId,
    type: data.type,
    message: data.message
  });
}
async function getAllFeedback() {
  const db = await getDb();
  if (!db) return [];
  const { feedbacks: feedbacks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { desc: desc2 } = await import("drizzle-orm");
  return await db.select().from(feedbacks2).orderBy(desc2(feedbacks2.createdAt));
}
async function getFeedbackStats() {
  const db = await getDb();
  if (!db) return [];
  const { feedbacks: feedbacks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { sql } = await import("drizzle-orm");
  return await db.select({
    type: feedbacks2.type,
    count: sql`COUNT(*)`.as("count")
  }).from(feedbacks2).groupBy(feedbacks2.type);
}
async function recordUserSession(userId) {
  const db = await getDb();
  if (!db) return;
  const { userProfiles: userProfiles2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq3, and: and2 } = await import("drizzle-orm");
  const profile = await db.select().from(userProfiles2).where(eq3(userProfiles2.userId, userId)).limit(1);
  if (!profile.length) return;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  await db.update(userProfiles2).set({ lastActiveDate: today }).where(eq3(userProfiles2.userId, userId));
}
async function getUserRetentionMetrics(userId) {
  const db = await getDb();
  if (!db) return null;
  const { userProfiles: userProfiles2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq3 } = await import("drizzle-orm");
  const profile = await db.select().from(userProfiles2).where(eq3(userProfiles2.userId, userId)).limit(1);
  if (!profile.length) return null;
  const p = profile[0];
  const createdAt = new Date(p.createdAt);
  const now = /* @__PURE__ */ new Date();
  const daysSinceSignup = Math.floor((now.getTime() - createdAt.getTime()) / (1e3 * 60 * 60 * 24));
  return {
    userId,
    daysSinceSignup,
    lastActiveDate: p.lastActiveDate,
    currentStreak: p.currentStreak,
    createdAt: p.createdAt
  };
}
async function getRetentionCohort(days) {
  const db = await getDb();
  if (!db) return [];
  const { users: users2, userProfiles: userProfiles2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq3, gte: gte2, lte, and: and2, sql } = await import("drizzle-orm");
  const cutoffDate = /* @__PURE__ */ new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cohort = await db.select({
    userId: users2.id,
    email: users2.email,
    createdAt: users2.createdAt,
    lastActiveDate: userProfiles2.lastActiveDate,
    isActive: sql`${userProfiles2.lastActiveDate} IS NOT NULL`
  }).from(users2).innerJoin(userProfiles2, eq3(users2.id, userProfiles2.userId)).where(and2(
    gte2(users2.createdAt, cutoffDate),
    lte(users2.createdAt, /* @__PURE__ */ new Date())
  ));
  return cohort;
}
async function storeCoachConversation(userId, nervousSystemState, userMessage, coachMessage, suggestedTechniqueId, suggestedTechniqueName) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot store coach conversation: database not available");
    return null;
  }
  try {
    const { coachConversations: coachConversations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const result = await db.insert(coachConversations2).values({
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
async function getCoachConversationHistory(userId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  try {
    const { coachConversations: coachConversations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3, desc: desc2 } = await import("drizzle-orm");
    const conversations = await db.select().from(coachConversations2).where(eq3(coachConversations2.userId, userId)).orderBy(desc2(coachConversations2.createdAt)).limit(limit);
    return conversations;
  } catch (error) {
    console.error("[Database] Error fetching coach conversations:", error);
    return [];
  }
}
async function recordTechniqueFeedback(conversationId, helpfulRating, notes) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record technique feedback: database not available");
    return null;
  }
  try {
    const { coachConversations: coachConversations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3 } = await import("drizzle-orm");
    const result = await db.update(coachConversations2).set({
      techniqueHelpfulRating: helpfulRating,
      techniqueNotes: notes
    }).where(eq3(coachConversations2.id, conversationId));
    return result;
  } catch (error) {
    console.error("[Database] Error recording technique feedback:", error);
    return null;
  }
}
async function updateTechniqueEffectiveness(userId, techniqueId, techniqueName, techniqueCategory, nervousSystemState, helpfulRating) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update technique effectiveness: database not available");
    return null;
  }
  try {
    const { userTechniqueEffectiveness: userTechniqueEffectiveness2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3, and: and2 } = await import("drizzle-orm");
    const existing = await db.select().from(userTechniqueEffectiveness2).where(
      and2(
        eq3(userTechniqueEffectiveness2.userId, userId),
        eq3(userTechniqueEffectiveness2.techniqueId, techniqueId)
      )
    ).limit(1);
    if (existing.length > 0) {
      const current = existing[0];
      const newTotalRatings = current.totalRatings + 1;
      const newAverageRating = (parseFloat(current.averageRating.toString()) * current.totalRatings + helpfulRating) / newTotalRatings;
      const stateField = `effectiveFor${nervousSystemState.charAt(0).toUpperCase() + nervousSystemState.slice(1)}`;
      const updates = {
        timesUsed: current.timesUsed + 1,
        averageRating: newAverageRating,
        totalRatings: newTotalRatings
      };
      if (helpfulRating >= 4) {
        updates[stateField] = current[stateField] + 1;
      }
      await db.update(userTechniqueEffectiveness2).set(updates).where(
        and2(
          eq3(userTechniqueEffectiveness2.userId, userId),
          eq3(userTechniqueEffectiveness2.techniqueId, techniqueId)
        )
      );
    } else {
      const updates = {
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
      await db.insert(userTechniqueEffectiveness2).values(updates);
    }
    return true;
  } catch (error) {
    console.error("[Database] Error updating technique effectiveness:", error);
    return null;
  }
}
async function getEffectiveTechniquesForUser(userId, nervousSystemState, limit = 5) {
  const db = await getDb();
  if (!db) return [];
  try {
    const { userTechniqueEffectiveness: userTechniqueEffectiveness2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3, desc: desc2 } = await import("drizzle-orm");
    const stateField = `effectiveFor${nervousSystemState.charAt(0).toUpperCase() + nervousSystemState.slice(1)}`;
    const techniques = await db.select().from(userTechniqueEffectiveness2).where(eq3(userTechniqueEffectiveness2.userId, userId)).orderBy(desc2(userTechniqueEffectiveness2.averageRating)).limit(limit);
    return techniques;
  } catch (error) {
    console.error("[Database] Error fetching effective techniques:", error);
    return [];
  }
}
async function addCoinsToUser(userId, coins) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { eq: eq3 } = await import("drizzle-orm");
    const profile = await db.select().from(userProfiles).where(eq3(userProfiles.userId, userId)).limit(1);
    if (!profile.length) {
      throw new Error("User profile not found");
    }
    const currentCoins = profile[0].coins || 0;
    const newCoins = currentCoins + coins;
    await db.update(userProfiles).set({ coins: newCoins }).where(eq3(userProfiles.userId, userId));
    const updated = await db.select().from(userProfiles).where(eq3(userProfiles.userId, userId)).limit(1);
    return updated[0];
  } catch (error) {
    console.error("[Database] Error adding coins to user:", error);
    throw error;
  }
}
async function getUserCoins(userId) {
  const db = await getDb();
  if (!db) return 0;
  try {
    const { eq: eq3 } = await import("drizzle-orm");
    const profile = await db.select().from(userProfiles).where(eq3(userProfiles.userId, userId)).limit(1);
    return profile.length > 0 ? profile[0].coins || 0 : 0;
  } catch (error) {
    console.error("[Database] Error getting user coins:", error);
    return 0;
  }
}
async function createCoinPurchase(userId, packageId, coinsAmount, priceInCents, stripePaymentIntentId, stripeSessionId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { coinPurchases: coinPurchases2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const result = await db.insert(coinPurchases2).values({
      userId,
      packageId,
      coinsAmount,
      priceInCents,
      stripePaymentIntentId,
      stripeSessionId,
      status: "pending"
    });
    return result;
  } catch (error) {
    console.error("[Database] Error creating coin purchase:", error);
    throw error;
  }
}
async function updateCoinPurchaseStatus(stripePaymentIntentId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { coinPurchases: coinPurchases2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3 } = await import("drizzle-orm");
    const completedAt = status === "completed" ? /* @__PURE__ */ new Date() : null;
    await db.update(coinPurchases2).set({
      status,
      completedAt
    }).where(eq3(coinPurchases2.stripePaymentIntentId, stripePaymentIntentId));
  } catch (error) {
    console.error("[Database] Error updating coin purchase status:", error);
    throw error;
  }
}
async function getUserPaymentHistory(userId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  try {
    const { coinPurchases: coinPurchases2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3, desc: desc2 } = await import("drizzle-orm");
    const history = await db.select().from(coinPurchases2).where(eq3(coinPurchases2.userId, userId)).orderBy(desc2(coinPurchases2.createdAt)).limit(limit);
    return history;
  } catch (error) {
    console.error("[Database] Error getting payment history:", error);
    return [];
  }
}
async function createReferralCode(referrerId, referralCode) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { referrals: referrals2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const result = await db.insert(referrals2).values({
      referrerId,
      referredUserId: referrerId,
      // Placeholder, will be updated when referred user signs up
      referralCode,
      isActive: 1
    });
    return result;
  } catch (error) {
    console.error("[Database] Error creating referral code:", error);
    throw error;
  }
}
async function getReferralByCode(referralCode) {
  const db = await getDb();
  if (!db) return null;
  try {
    const { referrals: referrals2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3 } = await import("drizzle-orm");
    const referral = await db.select().from(referrals2).where(eq3(referrals2.referralCode, referralCode)).limit(1);
    return referral.length > 0 ? referral[0] : null;
  } catch (error) {
    console.error("[Database] Error getting referral by code:", error);
    return null;
  }
}
async function awardReferralBonus(referrerId, referredUserId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { referrals: referrals2, userProfiles: userProfiles2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3 } = await import("drizzle-orm");
    const referrerProfile = await db.select().from(userProfiles2).where(eq3(userProfiles2.userId, referrerId)).limit(1);
    const referredProfile = await db.select().from(userProfiles2).where(eq3(userProfiles2.userId, referredUserId)).limit(1);
    if (referrerProfile.length > 0) {
      await db.update(userProfiles2).set({
        coins: (referrerProfile[0].coins || 0) + 50
        // Referrer gets 50 coins
      }).where(eq3(userProfiles2.userId, referrerId));
    }
    if (referredProfile.length > 0) {
      await db.update(userProfiles2).set({
        coins: (referredProfile[0].coins || 0) + 25
        // Referred user gets 25 coins
      }).where(eq3(userProfiles2.userId, referredUserId));
    }
    await db.update(referrals2).set({
      referredUserId,
      bonusCoinsAwarded: 75,
      // Total awarded
      claimedAt: /* @__PURE__ */ new Date(),
      bonusAwardedAt: /* @__PURE__ */ new Date()
    }).where(eq3(referrals2.referrerId, referrerId));
  } catch (error) {
    console.error("[Database] Error awarding referral bonus:", error);
    throw error;
  }
}
async function getUserReferralStats(userId) {
  const db = await getDb();
  if (!db) return null;
  try {
    const { referrals: referrals2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3 } = await import("drizzle-orm");
    const userReferrals = await db.select().from(referrals2).where(eq3(referrals2.referrerId, userId));
    const successfulReferrals = userReferrals.filter((r) => r.claimedAt !== null);
    const totalBonusCoins = userReferrals.reduce((sum, r) => sum + (r.bonusCoinsAwarded || 0), 0);
    return {
      totalReferrals: userReferrals.length,
      successfulReferrals: successfulReferrals.length,
      totalBonusCoins,
      referrals: userReferrals
    };
  } catch (error) {
    console.error("[Database] Error getting referral stats:", error);
    return null;
  }
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
init_db();
import { z as z8 } from "zod";
import Stripe2 from "stripe";

// shared/products.ts
var PRODUCTS = {
  PREMIUM_LIFETIME: {
    name: "Dopamine Dasher Premium - Lifetime Access",
    description: "One payment. Yours forever. Unlock all premium features.",
    price: 9.99,
    currency: "usd",
    type: "one_time",
    features: [
      "All premium themes (Cyberpunk, Ocean, Sunset, Lavender)",
      "Cloud sync across devices",
      "Advanced analytics and insights",
      "Custom mascot accessories",
      "Wallpaper generator",
      "Priority support",
      "All future updates included"
    ]
  }
};

// server/decisionTreeRouter.ts
init_db();
import { z as z2 } from "zod";

// server/sequencing.ts
var TIME_BRACKETS = {
  "15min": 15,
  "30min": 30,
  "1hour": 60,
  "2plus": 120
};
var STATE_STRATEGIES = {
  squirrel: {
    // Overwhelmed: Start TINY, build momentum
    sequence: ["micro", "easy", "medium", "deep"],
    requiresWarmup: false,
    warmupDuration: 0,
    warmupActivity: ""
  },
  tired: {
    // Low energy: Movement first, then tasks
    sequence: ["easy", "medium", "deep"],
    requiresWarmup: true,
    warmupDuration: 5,
    warmupActivity: "Movement/Stretch (5 min)"
  },
  focused: {
    // Good energy: Can jump to deep work
    sequence: ["medium", "deep", "easy"],
    requiresWarmup: false,
    warmupDuration: 0,
    warmupActivity: ""
  },
  hurting: {
    // Pain/dysregulated: Rest first
    sequence: [],
    requiresWarmup: true,
    warmupDuration: 20,
    warmupActivity: "Rest Activity (Bath/Nap/Quiet time - 20 min)"
  }
};
function sequenceTasks(userState, timeAvailable, tasks2) {
  const strategy = STATE_STRATEGIES[userState];
  const totalTime = TIME_BRACKETS[timeAvailable];
  const sequenced = [];
  let timeUsed = 0;
  let taskOrder = 1;
  if (userState === "hurting") {
    sequenced.push({
      taskId: 0,
      title: strategy.warmupActivity,
      order: taskOrder++,
      estimatedDuration: strategy.warmupDuration,
      reason: "Nervous system regulation - rest is productive"
    });
    timeUsed += strategy.warmupDuration;
    if (timeUsed < totalTime) {
      const remainingTime = totalTime - timeUsed;
      const gentleTasks = tasks2.filter((t2) => t2.activationEnergy === "micro" || t2.activationEnergy === "easy");
      for (const task of gentleTasks) {
        if (timeUsed + task.durationMinutes <= totalTime) {
          sequenced.push({
            taskId: task.id,
            title: task.title,
            order: taskOrder++,
            estimatedDuration: task.durationMinutes,
            reason: "Gentle re-engagement after rest"
          });
          timeUsed += task.durationMinutes;
        }
      }
    }
    return sequenced;
  }
  if (strategy.requiresWarmup) {
    sequenced.push({
      taskId: 0,
      title: strategy.warmupActivity,
      order: taskOrder++,
      estimatedDuration: strategy.warmupDuration,
      reason: "Nervous system activation - movement increases dopamine"
    });
    timeUsed += strategy.warmupDuration;
  }
  for (const energyLevel of strategy.sequence) {
    const tasksAtLevel = tasks2.filter((t2) => t2.activationEnergy === energyLevel);
    const sortedTasks = energyLevel === "micro" || energyLevel === "easy" ? tasksAtLevel.sort((a, b) => a.durationMinutes - b.durationMinutes) : tasksAtLevel;
    for (const task of sortedTasks) {
      if (timeUsed + task.durationMinutes <= totalTime) {
        sequenced.push({
          taskId: task.id,
          title: task.title,
          order: taskOrder++,
          estimatedDuration: task.durationMinutes,
          reason: getReason(userState, energyLevel, taskOrder - 1)
        });
        timeUsed += task.durationMinutes;
      }
    }
  }
  return sequenced;
}
function getReason(state, energyLevel, position) {
  if (position === 1) {
    if (state === "squirrel") {
      return "Start tiny to build momentum";
    } else if (state === "tired") {
      return "After movement, tackle easy wins";
    } else if (state === "focused") {
      return "You're ready for meaningful work";
    }
  }
  if (energyLevel === "micro") {
    return "Micro-win to build momentum";
  } else if (energyLevel === "easy") {
    return "Easy win to build confidence";
  } else if (energyLevel === "medium") {
    return "Medium task - you have momentum now";
  } else if (energyLevel === "deep") {
    return "Deep work - you're in the zone";
  }
  return "Recommended task";
}
function calculateTotalDuration(sequenced) {
  return sequenced.reduce((total, task) => total + task.estimatedDuration, 0);
}
function getEncouragementMessage(state, taskPosition, totalTasks) {
  const messages = {
    squirrel: [
      "Just start with this one tiny thing. You've got this! \u{1F4AA}",
      "Look at you building momentum! \u{1F680}",
      "You're on a roll! Keep going! \u2728",
      "You're crushing it! One more? \u{1F389}"
    ],
    tired: [
      "That movement helped! Now let's tackle something easy \u{1F4AA}",
      "You're waking up! Great job! \u26A1",
      "Energy is building! Keep it going! \u{1F525}",
      "You're doing amazing! \u{1F31F}"
    ],
    focused: [
      "You're in the zone! Let's use this energy \u{1F3AF}",
      "This is your peak time - go deep! \u{1F680}",
      "You're crushing it! Keep the momentum! \u{1F4AA}",
      "Perfect focus! You've got this! \u2728"
    ],
    hurting: [
      "Rest is productive. Be gentle with yourself \u{1F49A}",
      "Take the time you need. You're doing great \u{1F33F}",
      "Healing is progress. You've got this \u{1F9D8}",
      "Listen to your body. You're doing amazing \u{1F49A}"
    ]
  };
  const stateMessages = messages[state];
  return stateMessages[Math.min(taskPosition - 1, stateMessages.length - 1)];
}
function validateSequence(sequenced, timeAvailable) {
  const totalTime = TIME_BRACKETS[timeAvailable];
  const totalDuration = calculateTotalDuration(sequenced);
  const timeRemaining = totalTime - totalDuration;
  const warnings = [];
  if (totalDuration > totalTime) {
    warnings.push(`Sequence exceeds available time by ${totalDuration - totalTime} minutes`);
  }
  if (sequenced.length === 0) {
    warnings.push("No tasks in sequence");
  }
  return {
    isValid: totalDuration <= totalTime && sequenced.length > 0,
    totalDuration,
    timeRemaining: Math.max(0, timeRemaining),
    warnings
  };
}

// server/decisionTreeRouter.ts
var decisionTreeRouter = router({
  recordState: protectedProcedure.input(z2.object({
    state: z2.enum(["squirrel", "tired", "focused", "hurting"]),
    description: z2.string().optional()
  })).mutation(async ({ ctx, input }) => {
    await recordNervousSystemState(ctx.user.id, input.state, input.description);
    return { success: true };
  }),
  getLatestState: protectedProcedure.query(async ({ ctx }) => {
    return await getLatestNervousSystemState(ctx.user.id);
  }),
  sequenceTasks: protectedProcedure.input(z2.object({
    timeAvailable: z2.enum(["15min", "30min", "1hour", "2plus"]),
    userState: z2.enum(["squirrel", "tired", "focused", "hurting"]),
    taskIds: z2.array(z2.number()).optional()
  })).mutation(async ({ ctx, input }) => {
    let userTasks = await getUserTasks(ctx.user.id, false);
    if (input.taskIds && input.taskIds.length > 0) {
      userTasks = userTasks.filter((t2) => input.taskIds.includes(t2.id));
    }
    const tasksForSequencing = userTasks.map((t2) => ({
      id: t2.id,
      title: t2.title,
      durationMinutes: t2.durationMinutes || 5,
      activationEnergy: t2.activationEnergy || "easy",
      recommendedState: t2.recommendedState || void 0,
      sequenceGroup: t2.sequenceGroup || void 0,
      sequenceOrder: t2.sequenceOrder || void 0
    }));
    const sequenced = sequenceTasks(
      input.userState,
      input.timeAvailable,
      tasksForSequencing
    );
    const validation = validateSequence(sequenced, input.timeAvailable);
    await createDecisionTreeSession({
      userId: ctx.user.id,
      timeAvailable: input.timeAvailable,
      userState: input.userState,
      brainDumpTasks: userTasks.map((t2) => t2.title),
      sequencedTasks: sequenced.map((s) => ({
        taskId: s.taskId,
        order: s.order,
        estimatedDuration: s.estimatedDuration
      }))
    });
    return {
      sequenced,
      totalDuration: validation.totalDuration,
      timeRemaining: validation.timeRemaining,
      isValid: validation.isValid,
      warnings: validation.warnings
    };
  }),
  getEncouragement: protectedProcedure.input(z2.object({
    state: z2.enum(["squirrel", "tired", "focused", "hurting"]),
    taskPosition: z2.number().min(1),
    totalTasks: z2.number().min(1)
  })).query(({ input }) => {
    return getEncouragementMessage(
      input.state,
      input.taskPosition,
      input.totalTasks
    );
  }),
  getTasksForBrainCheck: protectedProcedure.input(z2.object({
    timeAvailable: z2.enum(["5min", "15min", "30min", "1hour", "2plus"]).optional()
  })).query(async ({ ctx, input }) => {
    const userTasks = await getUserTasks(ctx.user.id, false);
    const timeMinutesMap = {
      "5min": 5,
      "15min": 15,
      "30min": 30,
      "1hour": 60,
      "2plus": 999
    };
    let filteredTasks = userTasks;
    if (input.timeAvailable) {
      const timeLimit = timeMinutesMap[input.timeAvailable];
      filteredTasks = userTasks.filter((t2) => (t2.durationMinutes || 5) <= timeLimit);
    }
    return filteredTasks.map((t2) => ({
      id: t2.id,
      title: t2.title,
      durationMinutes: t2.durationMinutes || 5,
      activationEnergy: t2.activationEnergy || "easy",
      category: t2.category || void 0
    }));
  })
});

// server/pickAndWinRouter.ts
init_db();
import { z as z3 } from "zod";
import { nanoid } from "nanoid";
var CHARACTER_DISCOUNTS = {
  focused: 25,
  energized: 20,
  creative: 15,
  chill: 0
  // Free trial instead
};
var generateDiscountCode = () => {
  return `DD-${nanoid(8).toUpperCase()}`;
};
var getWeekStart = (date = /* @__PURE__ */ new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  return weekStart.toISOString().split("T")[0];
};
var pickAndWinRouter = router({
  /**
   * Pick a character and generate a discount code
   */
  pickCharacter: protectedProcedure.input(
    z3.object({
      character: z3.enum(["focused", "energized", "creative", "chill"])
    })
  ).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const { character } = input;
    const discountCode = generateDiscountCode();
    const discountPercent = CHARACTER_DISCOUNTS[character];
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await createCharacterPick({
      userId,
      character,
      discountPercent,
      discountCode,
      expiresAt
    });
    return {
      discountCode,
      discountPercent,
      character,
      expiresAt: expiresAt.toISOString()
    };
  }),
  /**
   * Check if user can pick weekly bonus
   */
  canPickWeekly: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const weekStart = getWeekStart();
    const existingPick = await getWeeklyCharacterPick(userId, weekStart);
    return {
      canPick: !existingPick,
      lastPickDate: existingPick?.pickedAt || null
    };
  }),
  /**
   * Pick weekly bonus character
   */
  pickWeeklyBonus: protectedProcedure.input(
    z3.object({
      character: z3.enum(["focused", "energized", "creative", "chill"])
    })
  ).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const { character } = input;
    const weekStart = getWeekStart();
    const existingPick = await getWeeklyCharacterPick(userId, weekStart);
    if (existingPick) {
      throw new Error("You already picked your weekly bonus this week!");
    }
    const bonusCoins = 50;
    await createWeeklyCharacterPick({
      userId,
      character,
      bonusCoins,
      weekStartDate: weekStart
    });
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      await updateUserProfile(userId, {
        coins: (userProfile.coins || 0) + bonusCoins
      });
    }
    return {
      character,
      bonusCoins,
      totalCoins: (userProfile?.coins || 0) + bonusCoins
    };
  }),
  /**
   * Get user's pick history
   */
  getPickHistory: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const picks = await getCharacterPickHistory(userId);
    return picks;
  })
});

// server/feedbackRouter.ts
import { z as z4 } from "zod";
init_db();
var feedbackRouter = router({
  submit: publicProcedure.input(
    z4.object({
      type: z4.enum(["bug", "feature", "general"]),
      message: z4.string().min(1).max(1e3)
    })
  ).mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id || null;
    return await submitFeedback({
      userId,
      type: input.type,
      message: input.message
    });
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return await getAllFeedback();
  }),
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return await getFeedbackStats();
  })
});

// server/retentionRouter.ts
init_db();
import { z as z5 } from "zod";
var retentionRouter = router({
  // Record a user session (called on app load)
  recordSession: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await recordUserSession(ctx.user.id);
      return { success: true };
    } catch (error) {
      console.error("Failed to record session:", error);
      return { success: false };
    }
  }),
  // Get user retention metrics
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const metrics = await getUserRetentionMetrics(ctx.user.id);
      return metrics;
    } catch (error) {
      console.error("Failed to get retention metrics:", error);
      return null;
    }
  }),
  // Get retention cohort (admin only)
  getCohort: protectedProcedure.input(z5.object({
    days: z5.number().min(1).max(90)
  })).query(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    try {
      const cohort = await getRetentionCohort(input.days);
      const totalUsers = cohort.length;
      const activeUsers = cohort.filter((u) => u.isActive).length;
      const retentionRate = totalUsers > 0 ? activeUsers / totalUsers * 100 : 0;
      return {
        totalUsers,
        activeUsers,
        retentionRate: Math.round(retentionRate * 100) / 100,
        cohort: cohort.map((u) => ({
          userId: u.userId,
          email: u.email,
          createdAt: u.createdAt,
          lastActiveDate: u.lastActiveDate,
          isActive: u.isActive,
          daysSinceSignup: Math.floor(
            ((/* @__PURE__ */ new Date()).getTime() - new Date(u.createdAt).getTime()) / (1e3 * 60 * 60 * 24)
          )
        }))
      };
    } catch (error) {
      console.error("Failed to get cohort:", error);
      return null;
    }
  }),
  // Get D1/D7/D30 retention rates (admin only)
  getRetentionRates: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    try {
      const d1Cohort = await getRetentionCohort(1);
      const d7Cohort = await getRetentionCohort(7);
      const d30Cohort = await getRetentionCohort(30);
      const calculateRate = (cohort) => {
        const total = cohort.length;
        const active = cohort.filter((u) => u.isActive).length;
        return total > 0 ? Math.round(active / total * 1e4) / 100 : 0;
      };
      return {
        d1Retention: calculateRate(d1Cohort),
        d7Retention: calculateRate(d7Cohort),
        d30Retention: calculateRate(d30Cohort),
        d1Users: d1Cohort.length,
        d7Users: d7Cohort.length,
        d30Users: d30Cohort.length
      };
    } catch (error) {
      console.error("Failed to get retention rates:", error);
      return null;
    }
  }),
  // Get funnel analytics (admin only)
  getFunnelAnalytics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    try {
      return {
        signups: 0,
        completedOnboarding: 0,
        completedFirstTask: 0,
        usedBrainCheck: 0,
        completedSecondDay: 0,
        funnelStages: [
          { stage: "Signup", count: 0, dropoff: 0 },
          { stage: "Onboarding", count: 0, dropoff: 0 },
          { stage: "First Task", count: 0, dropoff: 0 },
          { stage: "Brain Check", count: 0, dropoff: 0 },
          { stage: "Day 2 Return", count: 0, dropoff: 0 }
        ]
      };
    } catch (error) {
      console.error("Failed to get funnel analytics:", error);
      return null;
    }
  })
});

// server/coachRouter.ts
import { z as z6 } from "zod";

// server/_core/llm.ts
init_env();
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/therapyKnowledgeBase.ts
var groundingTechniques = [
  {
    id: "grounding-5-4-3-2-1",
    name: "5-4-3-2-1 Grounding",
    category: "grounding",
    state: ["squirrel", "hurting"],
    description: "Sensory grounding technique to anchor to the present moment",
    steps: [
      "Name 5 things you can see right now",
      "Name 4 things you can physically feel (texture, temperature)",
      "Name 3 things you can hear",
      "Name 2 things you can smell (or imagine)",
      "Name 1 thing you can taste"
    ],
    duration: 2,
    evidence: "DBT distress tolerance skill; reduces anxiety and hyperarousal",
    coachPrompt: "Your brain is bouncing around. Let's anchor to the present moment with the 5-4-3-2-1 technique. This takes 2 minutes and works fast."
  },
  {
    id: "grounding-box-breathing",
    name: "Box Breathing",
    category: "grounding",
    state: ["hurting", "squirrel"],
    description: "Controlled breathing to regulate nervous system",
    steps: [
      "Breathe in for 4 counts",
      "Hold for 4 counts",
      "Breathe out for 4 counts",
      "Hold for 4 counts",
      "Repeat 5 times"
    ],
    duration: 3,
    evidence: "Vagal toning; reduces cortisol and activates parasympathetic nervous system",
    coachPrompt: "Your nervous system needs to calm down. Box breathing takes 3 minutes and resets your body's stress response."
  },
  {
    id: "grounding-body-scan",
    name: "Quick Body Scan",
    category: "grounding",
    state: ["squirrel", "hurting"],
    description: "Progressive muscle awareness to ground in body",
    steps: [
      "Tense your toes for 3 seconds, then release",
      "Tense your legs for 3 seconds, then release",
      "Tense your core for 3 seconds, then release",
      "Tense your arms for 3 seconds, then release",
      "Tense your face for 3 seconds, then release"
    ],
    duration: 2,
    evidence: "Progressive muscle relaxation; interrupts anxiety loop",
    coachPrompt: "Let's get you back in your body. This quick scan takes 2 minutes and resets your nervous system."
  }
];
var motivationTechniques = [
  {
    id: "motivation-micro-commitment",
    name: "Micro-Commitment",
    category: "motivation",
    state: ["tired", "squirrel"],
    description: "Commit to just 2 minutes to bypass activation energy",
    steps: [
      `Say out loud: "I'm doing this for 2 minutes only"`,
      "Set a 2-minute timer",
      "Start the task",
      "At 2 minutes, decide: continue or stop (both are wins)"
    ],
    duration: 2,
    evidence: "ADHD activation energy research; reduces decision paralysis",
    coachPrompt: "Your ADHD brain needs activation energy. Just commit to 2 minutes. That's it. No guilt if you stop."
  },
  {
    id: "motivation-dopamine-stacking",
    name: "Dopamine Stacking",
    category: "motivation",
    state: ["tired", "squirrel"],
    description: "Pair boring task with something enjoyable",
    steps: [
      "Choose your boring task",
      "Pick something you enjoy (music, snack, movement)",
      "Do them together",
      "Celebrate the completion"
    ],
    duration: 1,
    evidence: "Behavioral pairing; increases dopamine for low-stimulation tasks",
    coachPrompt: "Let's hack your dopamine. Pair this task with something you enjoy. Music? Snack? Movement? Your brain will thank you."
  },
  {
    id: "motivation-implementation-intention",
    name: "Implementation Intention",
    category: "motivation",
    state: ["tired", "squirrel", "focused"],
    description: "Create if-then plan to reduce decision friction",
    steps: [
      'Identify the trigger: "When I finish breakfast..."',
      'Define the action: "...I immediately open my task list"',
      "Say it out loud 3 times",
      "Follow through when the trigger happens"
    ],
    duration: 1,
    evidence: "Implementation intentions reduce executive load; ADHD-friendly",
    coachPrompt: "Your ADHD brain hates decisions. Let's create an if-then plan so your brain knows exactly what to do next."
  }
];
var breakdownTechniques = [
  {
    id: "breakdown-two-minute-rule",
    name: "Two-Minute Rule",
    category: "breakdown",
    state: ["squirrel", "tired", "hurting", "focused"],
    description: "Break tasks into 2-minute chunks",
    steps: [
      "Look at the task",
      `Ask: "What's the first 2-minute piece?"`,
      "Do that piece",
      "Celebrate",
      "Repeat for next piece"
    ],
    duration: 2,
    evidence: "Behavioral activation; ADHD brains work in short bursts",
    coachPrompt: "This task feels big. Let's break it into 2-minute pieces. You can do anything for 2 minutes."
  },
  {
    id: "breakdown-reverse-planning",
    name: "Reverse Planning",
    category: "breakdown",
    state: ["squirrel", "hurting"],
    description: "Start from the end and work backwards",
    steps: [
      "Picture the finished task",
      "What's the last step?",
      "What comes before that?",
      "Keep going backwards until you find step 1",
      "Start with step 1"
    ],
    duration: 3,
    evidence: "Reduces overwhelm; ADHD brains see the big picture better",
    coachPrompt: "Let's work backwards from the finish line. This helps your ADHD brain see the path forward."
  },
  {
    id: "breakdown-smallest-next-step",
    name: "Smallest Next Step",
    category: "breakdown",
    state: ["squirrel", "tired", "focused"],
    description: "Find the absolute smallest action",
    steps: [
      "Look at the task",
      `Ask: "What's the smallest possible action?"`,
      "Do that action (even if it's just 30 seconds)",
      "Celebrate",
      `Ask again: "What's the next smallest action?"`
    ],
    duration: 1,
    evidence: "Overcomes activation energy barrier; momentum building",
    coachPrompt: "What's the tiniest action you can take right now? Not the whole task\u2014just the first micro-step."
  }
];
var cognitiveTechniques = [
  {
    id: "cognitive-thought-record",
    name: "Thought Record",
    category: "cognitive",
    state: ["hurting", "tired"],
    description: "Challenge negative ADHD thoughts",
    steps: [
      `Notice the thought: "I'm so lazy"`,
      `Ask: "Is this true? What's the evidence?"`,
      'Find the evidence against it: "I completed 3 tasks yesterday"',
      'Reframe: "I have ADHD, not laziness. My brain works differently."',
      "Notice how you feel"
    ],
    duration: 3,
    evidence: "CBT cognitive restructuring; reduces shame and self-blame",
    coachPrompt: "That voice saying you're lazy? That's ADHD shame talking. Let's challenge it with evidence."
  },
  {
    id: "cognitive-shame-interrupt",
    name: "Shame Interrupt",
    category: "cognitive",
    state: ["hurting"],
    description: "Interrupt shame spiral with self-compassion",
    steps: [
      'Notice the shame: "I failed again"',
      'Say: "This is a moment of suffering. Suffering is part of life."',
      `Say: "I'm not alone. Everyone with ADHD struggles with this."`,
      'Say: "What would I say to a friend right now?"',
      "Say it to yourself"
    ],
    duration: 2,
    evidence: "Self-compassion reduces shame; DBT distress tolerance",
    coachPrompt: "You're in a shame spiral. Let's interrupt it with the same compassion you'd give a friend."
  },
  {
    id: "cognitive-perfectionism-challenge",
    name: "Perfectionism Challenge",
    category: "cognitive",
    state: ["squirrel", "hurting"],
    description: "Challenge all-or-nothing thinking",
    steps: [
      `Notice: "If I can't do it perfectly, why try?"`,
      'Ask: "Is perfect required? Or just done?"',
      'Reframe: "Done is better than perfect. Progress over perfection."',
      "Start with 70% effort",
      "Celebrate the 70% version"
    ],
    duration: 2,
    evidence: "CBT cognitive distortion challenge; ADHD perfectionism pattern",
    coachPrompt: "Perfectionism is the enemy of done. Let's aim for 70% and celebrate it."
  }
];
var emotionTechniques = [
  {
    id: "emotion-tipp-skill",
    name: "TIPP Skill",
    category: "emotion",
    state: ["hurting", "squirrel"],
    description: "Temperature, Intense exercise, Paced breathing, Paired muscle relaxation",
    steps: [
      "Temperature: Splash cold water on your face or hold ice",
      "OR Intense exercise: 30 seconds of jumping jacks",
      "OR Paced breathing: Slow, deep breaths",
      "OR Paired muscle relaxation: Tense and release muscles",
      "Notice the shift"
    ],
    duration: 1,
    evidence: "DBT distress tolerance; activates vagal brake",
    coachPrompt: "Your emotions are overwhelming. Let's use TIPP to reset your nervous system fast."
  },
  {
    id: "emotion-opposite-action",
    name: "Opposite Action",
    category: "emotion",
    state: ["tired", "hurting", "focused"],
    description: "Act opposite to the emotion you're feeling",
    steps: [
      'Notice the emotion: "I feel like giving up"',
      "Do the opposite action: Take one small step forward",
      "Notice: Emotions follow actions",
      "Repeat"
    ],
    duration: 2,
    evidence: "DBT emotion regulation; emotions change when behavior changes",
    coachPrompt: `Your emotion is saying "quit". Let's do the opposite action and see what happens.`
  },
  {
    id: "emotion-abc-please",
    name: "ABC PLEASE",
    category: "emotion",
    state: ["tired", "hurting"],
    description: "Self-care checklist to regulate emotions",
    steps: [
      "Accumulate positive experiences: Do something enjoyable",
      "Build mastery: Complete a task (any size)",
      "Cope ahead: Plan for the next challenge",
      "Please: Take care of yourself (sleep, eat, move)",
      "Notice mood shift"
    ],
    duration: 5,
    evidence: "DBT emotion regulation; holistic self-care",
    coachPrompt: "Your emotions are dysregulated. Let's use ABC PLEASE to get back in balance."
  }
];
function getTechniquesForState(state) {
  const allTechniques = [
    ...groundingTechniques,
    ...motivationTechniques,
    ...breakdownTechniques,
    ...cognitiveTechniques,
    ...emotionTechniques
  ];
  return allTechniques.filter((t2) => t2.state.includes(state));
}
function getAllTechniques() {
  return [
    ...groundingTechniques,
    ...motivationTechniques,
    ...breakdownTechniques,
    ...cognitiveTechniques,
    ...emotionTechniques
  ];
}
function getRandomTechniqueForState(state) {
  const techniques = getTechniquesForState(state);
  if (techniques.length === 0) return null;
  return techniques[Math.floor(Math.random() * techniques.length)];
}

// server/coachPrompts.ts
function getStateGuidance(state) {
  const guidance = {
    squirrel: `The user's nervous system is in "squirrel" mode - scattered, overwhelmed, jumping between thoughts. 
    They need:
    - Permission to start small (2-5 minute tasks)
    - Reassurance that their scattered brain is normal for ADHD
    - Grounding techniques to anchor them
    - Micro-commitments instead of big goals
    - Celebration of tiny wins`,
    tired: `The user's nervous system is in "tired" mode - low energy, low dopamine, activation energy is high.
    They need:
    - Movement or stimulation FIRST before tasks
    - Dopamine stacking (pair boring task with something fun)
    - Permission to rest without guilt
    - Micro-movements to build momentum
    - Validation that low energy is a nervous system state, not laziness`,
    focused: `The user's nervous system is in "focused" mode - good energy, ready for work, dopamine is flowing.
    They need:
    - Encouragement to ride this wave
    - Permission to do deeper work now
    - Strategies to protect this state
    - Reminders to take breaks
    - Celebration of their momentum`,
    hurting: `The user's nervous system is in "hurting" mode - pain, dysregulation, overwhelm, possibly shutdown.
    They need:
    - Compassion and validation above all else
    - Permission to do NOTHING if needed
    - Gentle grounding and self-care first
    - Smallest possible actions (or rest)
    - Reassurance that this is temporary
    - Distress tolerance skills`
  };
  return guidance[state];
}
function getTechniquesForChallenge(challenge, state) {
  const techniques = getTechniquesForState(state);
  const challengeKeywords = {
    overwhelm: ["grounding", "emotion"],
    procrastination: ["motivation", "breakdown"],
    "can't start": ["motivation", "breakdown"],
    "too many tasks": ["breakdown", "cognitive"],
    "feeling bad": ["emotion", "cognitive"],
    "anxious": ["grounding", "emotion"],
    "tired": ["motivation", "emotion"],
    "stuck": ["motivation", "breakdown"],
    "perfectionism": ["cognitive", "breakdown"],
    "shame": ["cognitive", "emotion"]
  };
  let relevantCategories = [];
  for (const [keyword, categories] of Object.entries(challengeKeywords)) {
    if (challenge.toLowerCase().includes(keyword)) {
      relevantCategories = categories;
      break;
    }
  }
  if (relevantCategories.length === 0) {
    relevantCategories = ["grounding", "motivation"];
  }
  const filtered = techniques.filter((t2) => relevantCategories.includes(t2.category));
  if (filtered.length === 0) {
    return "";
  }
  return filtered.slice(0, 3).map((t2) => `- **${t2.name}** (${t2.duration} min): ${t2.description}`).join("\n");
}
function buildCoachSystemPrompt(context) {
  const stateGuidance = getStateGuidance(context.nervousSystemState);
  const techniques = getTechniquesForState(context.nervousSystemState);
  const techniqueList = techniques.slice(0, 5).map((t2) => `- **${t2.name}** (${t2.duration} min): ${t2.description}`).join("\n");
  let challengeContext = "";
  if (context.recentChallenge) {
    const relevantTechniques = getTechniquesForChallenge(context.recentChallenge, context.nervousSystemState);
    challengeContext = `

**Specific Challenge:** ${context.recentChallenge}
${relevantTechniques ? `
Relevant techniques for this challenge:
${relevantTechniques}` : ""}`;
  }
  let progressContext = "";
  if (context.tasksCompleted !== void 0 || context.streakDays !== void 0) {
    progressContext = "\n\n**User Progress:**";
    if (context.tasksCompleted !== void 0) {
      progressContext += `
- Tasks completed today: ${context.tasksCompleted}`;
    }
    if (context.streakDays !== void 0) {
      progressContext += `
- Current streak: ${context.streakDays} days`;
    }
    if (context.currentMood !== void 0) {
      progressContext += `
- Current mood: ${context.currentMood}/5`;
    }
  }
  return `You are Dashie, a compassionate AI behavioral therapy coach for people with ADHD. Your role is to provide evidence-based support using CBT/DBT techniques tailored to the user's nervous system state.

**Current User State: ${context.nervousSystemState.toUpperCase()}**

${stateGuidance}

**Available Techniques for This State:**
${techniqueList}

**Your Coaching Style:**
1. Be warm, non-judgmental, and celebrate small wins
2. Acknowledge ADHD-specific challenges without shame
3. Suggest concrete, time-bounded techniques (2-5 minutes)
4. Use the techniques above when relevant to the user's situation
5. Keep responses concise (2-3 sentences max) unless they ask for more detail
6. Ask clarifying questions if needed
7. Celebrate progress: "You're doing great for an ADHD brain"
8. Reframe challenges: "This isn't laziness, it's activation energy"
9. Offer micro-wins: "What's the smallest step right now?"
10. Use encouraging tone with emojis sparingly
11. Remember: You're here to support, not fix. Some days are just survival days, and that's okay.
12. If they mention pain/dysregulation: Prioritize grounding and self-care over productivity

**Important Boundaries:**
- You are NOT a replacement for mental health treatment
- If someone mentions suicidal thoughts or severe crisis, encourage them to contact a mental health professional
- You can suggest techniques, but the user decides what works for them
- Celebrate their autonomy and choices${challengeContext}${progressContext}`;
}

// server/coachRouter.ts
var coachRouter = router({
  /**
   * Get a therapeutic technique recommendation based on user's nervous system state
   */
  getTechniqueForState: protectedProcedure.input(z6.object({
    state: z6.enum(["squirrel", "tired", "focused", "hurting"]),
    category: z6.enum(["grounding", "motivation", "breakdown", "cognitive", "emotion"]).optional()
  })).query((opts) => {
    const { input } = opts;
    const techniques = input.category ? getAllTechniques().filter((t2) => t2.state.includes(input.state) && t2.category === input.category) : getTechniquesForState(input.state);
    if (techniques.length === 0) {
      return null;
    }
    return techniques[Math.floor(Math.random() * techniques.length)];
  }),
  /**
   * Chat with AI coach for real-time support
   * Uses therapy knowledge base + user context to provide personalized guidance
   */
  chat: protectedProcedure.input(z6.object({
    message: z6.string(),
    nervousSystemState: z6.enum(["squirrel", "tired", "focused", "hurting"]),
    context: z6.object({
      tasksCompleted: z6.number().optional(),
      currentMood: z6.number().optional(),
      // 1-5
      recentChallenge: z6.string().optional(),
      streakDays: z6.number().optional()
    }).optional()
  })).mutation(async (opts) => {
    const { input, ctx } = opts;
    const techniques = getTechniquesForState(input.nervousSystemState);
    const techniqueContext = techniques.slice(0, 3).map((t2) => `- ${t2.name}: ${t2.description} (${t2.duration} min)`).join("\n");
    const systemPrompt = buildCoachSystemPrompt({
      nervousSystemState: input.nervousSystemState,
      tasksCompleted: input.context?.tasksCompleted,
      currentMood: input.context?.currentMood,
      recentChallenge: input.context?.recentChallenge,
      streakDays: input.context?.streakDays
    });
    try {
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.message }
      ];
      const response = await invokeLLM({
        messages
      });
      const coachMessage = response.choices[0]?.message?.content || "I'm here to help. What's going on?";
      try {
        const { storeCoachConversation: storeCoachConversation2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        await storeCoachConversation2(
          ctx.user.id,
          input.nervousSystemState,
          input.message,
          typeof coachMessage === "string" ? coachMessage : "I'm here to help.",
          void 0,
          void 0
        );
      } catch (error) {
        console.warn("Could not store conversation:", error);
      }
      return {
        message: coachMessage,
        timestamp: /* @__PURE__ */ new Date(),
        suggestedTechnique: getRandomTechniqueForState(input.nervousSystemState)
      };
    } catch (error) {
      console.error("Coach chat error:", error);
      return {
        message: "I'm having trouble connecting right now. Try again in a moment, or pick a technique from the menu.",
        timestamp: /* @__PURE__ */ new Date(),
        suggestedTechnique: getRandomTechniqueForState(input.nervousSystemState)
      };
    }
  }),
  /**
   * Get all available techniques
   */
  getAllTechniques: protectedProcedure.query(() => {
    return getAllTechniques();
  }),
  /**
   * Get techniques for a specific nervous system state
   */
  getTechniquesForState: protectedProcedure.input(z6.enum(["squirrel", "tired", "focused", "hurting"])).query((opts) => {
    const { input } = opts;
    return getTechniquesForState(input);
  }),
  /**
   * Record that user completed a technique
   * Useful for tracking what works best for each user
   */
  recordTechniqueCompletion: protectedProcedure.input(z6.object({
    techniqueId: z6.string(),
    helpfulRating: z6.number().min(1).max(5),
    notes: z6.string().optional()
  })).mutation(async (opts) => {
    const { input, ctx } = opts;
    console.log(`User ${ctx.user.id} completed technique ${input.techniqueId} with rating ${input.helpfulRating}`);
    return {
      success: true,
      message: "Thanks for the feedback! This helps us personalize your coaching."
    };
  })
});

// server/paymentsRouter.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z7 } from "zod";
import Stripe from "stripe";

// shared/coinPackages.ts
var SUBSCRIPTION_TIERS = [
  {
    id: "starter",
    name: "Focus",
    monthlyPrice: 599,
    // $5.99
    monthlyPriceUSD: "$5.99",
    annualPrice: 7188,
    // $71.88 (10 months, 2 free)
    annualPriceUSD: "$71.88",
    monthlyCoins: 1e3,
    dailyBonus: 50,
    features: [
      "1,000 coins per month",
      "50 bonus coins daily",
      "Basic task insights",
      "Standard support"
    ],
    popular: false
  },
  {
    id: "pro",
    name: "Momentum",
    monthlyPrice: 1499,
    // $14.99
    monthlyPriceUSD: "$14.99",
    annualPrice: 17988,
    // $179.88 (10 months, 2 free)
    annualPriceUSD: "$179.88",
    monthlyCoins: 3e3,
    dailyBonus: 150,
    features: [
      "3,000 coins per month",
      "150 bonus coins daily",
      "Advanced analytics",
      "Priority support",
      "Exclusive rewards",
      "Early access to features"
    ],
    popular: true
  }
];
function getSubscriptionTier(id) {
  return SUBSCRIPTION_TIERS.find((tier) => tier.id === id);
}

// server/paymentsRouter.ts
init_db();
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover"
});
var paymentsRouter = router({
  /**
   * Create a Stripe Checkout session for subscription
   * Supports monthly and annual billing periods
   * Payment methods: Apple Pay, PayPal, Card
   */
  createCheckoutSession: protectedProcedure.input(z7.object({
    tierId: z7.string(),
    billingPeriod: z7.enum(["monthly", "annual"])
  })).mutation(async ({ ctx, input }) => {
    const origin = ctx.req.headers.origin || `http://localhost:${process.env.PORT || 3e3}`;
    const tier = getSubscriptionTier(input.tierId);
    if (!tier) {
      throw new TRPCError3({
        code: "BAD_REQUEST",
        message: "Invalid subscription tier"
      });
    }
    try {
      const price = input.billingPeriod === "monthly" ? tier.monthlyPrice : tier.annualPrice;
      const interval = input.billingPeriod === "monthly" ? "month" : "year";
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card", "apple_pay", "paypal"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${tier.name} Subscription`,
                description: `${tier.monthlyCoins} coins/month + ${tier.dailyBonus} daily bonus`
              },
              unit_amount: price,
              recurring: {
                interval,
                interval_count: 1
              }
            },
            quantity: 1
          }
        ],
        success_url: `${origin}/buy-coins?success=true&tierId=${tier.id}`,
        cancel_url: `${origin}/buy-coins?cancelled=true`,
        customer_email: ctx.user.email || void 0,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          tier_id: tier.id,
          billing_period: input.billingPeriod,
          monthly_coins: tier.monthlyCoins.toString(),
          daily_bonus: tier.dailyBonus.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || ""
        },
        allow_promotion_codes: true
      });
      return {
        checkoutUrl: session.url,
        sessionId: session.id
      };
    } catch (error) {
      console.error("[Stripe] Error creating checkout session:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to create checkout session: ${error.message}`
      });
    }
  }),
  /**
   * Verify subscription payment and activate subscription
   * Called after successful Stripe payment
   */
  verifyPayment: protectedProcedure.input(z7.object({
    sessionId: z7.string()
  })).mutation(async ({ ctx, input }) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);
      if (session.payment_status !== "paid") {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Payment not completed"
        });
      }
      const metadata = session.metadata;
      if (!metadata || metadata.user_id !== ctx.user.id.toString()) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Invalid payment session"
        });
      }
      const monthlyCoins = parseInt(metadata.monthly_coins || "0");
      const updatedProfile = await addCoinsToUser(ctx.user.id, monthlyCoins);
      return {
        success: true,
        coinsAdded: monthlyCoins,
        newBalance: updatedProfile.coins
      };
    } catch (error) {
      console.error("[Stripe] Error verifying payment:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to verify payment: ${error.message}`
      });
    }
  }),
  /**
   * Get user's coin balance
   */
  getCoinBalance: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getUserProfile(ctx.user.id);
    return {
      coins: profile?.coins || 0
    };
  }),
  /**
   * Get user's payment history
   */
  getPaymentHistory: protectedProcedure.input(z7.object({ limit: z7.number().default(20) })).query(async ({ ctx, input }) => {
    return await getUserPaymentHistory(ctx.user.id, input.limit);
  }),
  /**
   * Generate referral code for user
   */
  generateReferralCode: protectedProcedure.mutation(async ({ ctx }) => {
    const code = `REF${ctx.user.id}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await createReferralCode(ctx.user.id, code);
    return { referralCode: code };
  }),
  /**
   * Get user's referral statistics
   */
  getReferralStats: protectedProcedure.query(async ({ ctx }) => {
    return await getUserReferralStats(ctx.user.id);
  }),
  /**
   * Claim referral bonus when new user signs up with code
   */
  claimReferralBonus: protectedProcedure.input(z7.object({ referralCode: z7.string() })).mutation(async ({ ctx, input }) => {
    const referral = await getReferralByCode(input.referralCode);
    if (!referral) {
      throw new TRPCError3({
        code: "NOT_FOUND",
        message: "Invalid referral code"
      });
    }
    if (referral.claimedAt) {
      throw new TRPCError3({
        code: "BAD_REQUEST",
        message: "This referral code has already been claimed"
      });
    }
    await awardReferralBonus(referral.referrerId, ctx.user.id);
    return { success: true, bonusCoins: 25 };
  })
});

// server/routers.ts
var stripe2 = new Stripe2(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover"
});
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // User Profile procedures
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      let profile = await getUserProfile(ctx.user.id);
      if (!profile) {
        await createUserProfile({
          userId: ctx.user.id,
          xp: 0,
          level: 1,
          coins: 0,
          currentStreak: 0,
          longestStreak: 0,
          vacationModeActive: 0,
          hasCompletedOnboarding: 0,
          soundEnabled: 1
        });
        profile = await getUserProfile(ctx.user.id);
      }
      return profile;
    }),
    update: protectedProcedure.input(z8.object({
      xp: z8.number().optional(),
      level: z8.number().optional(),
      coins: z8.number().optional(),
      currentStreak: z8.number().optional(),
      longestStreak: z8.number().optional(),
      lastActiveDate: z8.string().optional(),
      vacationModeActive: z8.number().optional(),
      vacationModeStartDate: z8.string().optional(),
      hasCompletedOnboarding: z8.number().optional(),
      selectedFlavor: z8.string().optional(),
      selectedContext: z8.string().optional(),
      selectedTheme: z8.string().optional(),
      mascotMood: z8.string().optional(),
      lastPetTime: z8.date().optional(),
      lastFeedTime: z8.date().optional(),
      purchasedItems: z8.array(z8.string()).optional(),
      equippedAccessories: z8.array(z8.string()).optional(),
      soundEnabled: z8.number().optional(),
      soundTheme: z8.string().optional()
    })).mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    })
  }),
  // Task procedures
  tasks: router({
    list: protectedProcedure.input(z8.object({
      completed: z8.boolean().optional()
    }).optional()).query(async ({ ctx, input }) => {
      return await getUserTasks(ctx.user.id, input?.completed);
    }),
    create: protectedProcedure.input(z8.object({
      title: z8.string(),
      type: z8.enum(["quick", "boss"]),
      category: z8.string().optional(),
      durationMinutes: z8.number().default(5),
      sequenceGroup: z8.string().optional(),
      sequenceOrder: z8.number().optional(),
      subtasks: z8.array(z8.object({
        id: z8.string(),
        text: z8.string(),
        completed: z8.boolean()
      })).optional(),
      xpReward: z8.number().default(10),
      coinReward: z8.number().default(5)
    })).mutation(async ({ ctx, input }) => {
      await createTask({
        userId: ctx.user.id,
        ...input,
        completed: 0
      });
      return { success: true };
    }),
    update: protectedProcedure.input(z8.object({
      id: z8.number(),
      title: z8.string().optional(),
      durationMinutes: z8.number().optional(),
      subtasks: z8.array(z8.object({
        id: z8.string(),
        text: z8.string(),
        completed: z8.boolean()
      })).optional(),
      completed: z8.number().optional(),
      completedAt: z8.date().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      await updateTask(id, ctx.user.id, updates);
      return { success: true };
    }),
    delete: protectedProcedure.input(z8.object({
      id: z8.number()
    })).mutation(async ({ ctx, input }) => {
      await deleteTask(input.id, ctx.user.id);
      return { success: true };
    })
  }),
  // Journal procedures
  journal: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserJournalEntries(ctx.user.id);
    }),
    create: protectedProcedure.input(z8.object({
      taskTitle: z8.string(),
      taskType: z8.string(),
      xpEarned: z8.number(),
      coinEarned: z8.number(),
      completedAt: z8.date(),
      date: z8.string()
    })).mutation(async ({ ctx, input }) => {
      await createJournalEntry({
        userId: ctx.user.id,
        ...input
      });
      return { success: true };
    })
  }),
  // Daily Affirmation procedures
  affirmation: router({
    getToday: protectedProcedure.input(z8.object({
      date: z8.string()
    })).query(async ({ ctx, input }) => {
      return await getTodayAffirmation(ctx.user.id, input.date);
    }),
    create: protectedProcedure.input(z8.object({
      message: z8.string(),
      shownDate: z8.string()
    })).mutation(async ({ ctx, input }) => {
      await createDailyAffirmation({
        userId: ctx.user.id,
        ...input
      });
      return { success: true };
    })
  }),
  // Habit procedures
  habits: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserHabits(ctx.user.id);
    }),
    create: protectedProcedure.input(z8.object({
      name: z8.string(),
      description: z8.string().optional(),
      frequency: z8.enum(["daily", "weekly", "custom"]).default("daily"),
      targetCount: z8.number().default(1)
    })).mutation(async ({ ctx, input }) => {
      const result = await createHabit({
        userId: ctx.user.id,
        ...input
      });
      return { success: true };
    }),
    complete: protectedProcedure.input(z8.object({
      habitId: z8.number()
    })).mutation(async ({ ctx, input }) => {
      return await completeHabit(input.habitId, ctx.user.id);
    }),
    getCompletions: protectedProcedure.input(z8.object({
      habitId: z8.number(),
      days: z8.number().default(30)
    })).query(async ({ ctx, input }) => {
      return await getHabitCompletions(input.habitId, ctx.user.id, input.days);
    })
  }),
  // Mood procedures
  mood: router({
    checkIn: protectedProcedure.input(z8.object({
      moodLevel: z8.number().min(1).max(5),
      energyLevel: z8.enum(["low", "medium", "high"]),
      notes: z8.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      await createMoodEntry({
        userId: ctx.user.id,
        date: today,
        ...input
      });
      return { success: true };
    }),
    getToday: protectedProcedure.query(async ({ ctx }) => {
      return await getTodayMoodEntry(ctx.user.id);
    }),
    getHistory: protectedProcedure.input(z8.object({
      days: z8.number().default(30)
    })).query(async ({ ctx, input }) => {
      return await getMoodHistory(ctx.user.id, input.days);
    })
  }),
  // Analytics procedures
  analytics: router({
    getStats: protectedProcedure.input(z8.object({
      date: z8.string()
    })).query(async ({ ctx, input }) => {
      return await getUserStats(ctx.user.id, input.date);
    }),
    getHistory: protectedProcedure.input(z8.object({
      days: z8.number().default(30)
    })).query(async ({ ctx, input }) => {
      return await getStatsHistory(ctx.user.id, input.days);
    })
  }),
  // Stripe payment procedures
  stripe: router({
    createCheckoutSession: protectedProcedure.mutation(async ({ ctx }) => {
      const origin = ctx.req.headers.origin || `http://localhost:${process.env.PORT || 3e3}`;
      try {
        const session = await stripe2.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: PRODUCTS.PREMIUM_LIFETIME.currency,
                product_data: {
                  name: PRODUCTS.PREMIUM_LIFETIME.name,
                  description: PRODUCTS.PREMIUM_LIFETIME.description
                },
                unit_amount: Math.round(PRODUCTS.PREMIUM_LIFETIME.price * 100)
                // Convert to cents
              },
              quantity: 1
            }
          ],
          success_url: `${origin}/settings?upgrade=success`,
          cancel_url: `${origin}/settings?upgrade=cancelled`,
          customer_email: ctx.user.email || void 0,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || ""
          },
          allow_promotion_codes: true
        });
        return {
          url: session.url,
          sessionId: session.id
        };
      } catch (error) {
        console.error("[Stripe] Error creating checkout session:", error);
        throw new Error(`Failed to create checkout session: ${error.message}`);
      }
    }),
    checkPremiumStatus: protectedProcedure.query(async ({ ctx }) => {
      return {
        isPremium: ctx.user.isPremium === 1,
        stripeCustomerId: ctx.user.stripeCustomerId
      };
    })
  }),
  // Engagement system procedures
  engagement: router({
    // Leaderboard
    getGlobalLeaderboard: publicProcedure.query(async () => {
      return await getGlobalLeaderboard(100);
    }),
    getUserRank: protectedProcedure.query(async ({ ctx }) => {
      return await getUserLeaderboardRank(ctx.user.id);
    }),
    // Contests
    getActiveContests: publicProcedure.query(async () => {
      return await getActiveContests();
    }),
    getContestProgress: protectedProcedure.input(z8.object({ contestId: z8.number() })).query(async ({ ctx, input }) => {
      return await getUserContestProgress(ctx.user.id, input.contestId);
    }),
    updateContestProgress: protectedProcedure.input(z8.object({ contestId: z8.number(), progress: z8.number() })).mutation(async ({ ctx, input }) => {
      await updateContestProgress(ctx.user.id, input.contestId, input.progress);
      return { success: true };
    }),
    getContestLeaderboard: publicProcedure.input(z8.object({ contestId: z8.number() })).query(async ({ input }) => {
      return await getContestLeaderboard(input.contestId);
    }),
    // Rewards
    getAllRewards: publicProcedure.query(async () => {
      return await getAllRewards();
    }),
    getUserRewards: protectedProcedure.query(async ({ ctx }) => {
      return await getUserRewards(ctx.user.id);
    }),
    purchaseReward: protectedProcedure.input(z8.object({ rewardId: z8.number() })).mutation(async ({ ctx, input }) => {
      const profile = await getUserProfile(ctx.user.id);
      const reward = (await getAllRewards()).find((r) => r.id === input.rewardId);
      if (!reward) throw new Error("Reward not found");
      if (!profile || profile.coins < reward.cost) throw new Error("Not enough coins");
      await updateUserProfile(ctx.user.id, {
        coins: profile.coins - reward.cost
      });
      await purchaseReward(ctx.user.id, input.rewardId);
      return { success: true };
    }),
    // Daily Check-in
    getTodayCheckIn: protectedProcedure.query(async ({ ctx }) => {
      return await getTodayCheckIn(ctx.user.id);
    }),
    createCheckIn: protectedProcedure.input(z8.object({
      energyLevel: z8.enum(["low", "medium", "high"]),
      vibe: z8.enum(["anxious", "bored", "overwhelmed", "energized"]),
      need: z8.enum(["quick-wins", "deep-focus", "movement", "rest"])
    })).mutation(async ({ ctx, input }) => {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      await createDailyCheckIn({
        userId: ctx.user.id,
        date: today,
        ...input
      });
      return { success: true };
    }),
    getCheckInHistory: protectedProcedure.input(z8.object({ days: z8.number().default(30) })).query(async ({ ctx, input }) => {
      return await getCheckInHistory(ctx.user.id, input.days);
    })
  }),
  emailVerification: router({
    sendVerificationCode: protectedProcedure.input(z8.object({ email: z8.string().email() })).mutation(async ({ ctx, input }) => {
      try {
        const code = await createEmailVerificationCode(ctx.user.id, input.email);
        console.log(`[Email Verification] Code for ${input.email}: ${code}`);
        return {
          success: true,
          message: "Verification code sent to email"
        };
      } catch (error) {
        console.error("[Email Verification] Error sending code:", error);
        throw new Error("Failed to send verification code");
      }
    }),
    verifyCode: protectedProcedure.input(z8.object({ code: z8.string().length(6) })).mutation(async ({ ctx, input }) => {
      try {
        const verified = await verifyEmailCode(ctx.user.id, input.code);
        if (!verified) {
          throw new Error("Invalid or expired verification code");
        }
        return {
          success: true,
          message: "Email verified successfully"
        };
      } catch (error) {
        console.error("[Email Verification] Error verifying code:", error);
        throw new Error("Failed to verify code");
      }
    }),
    getVerificationStatus: protectedProcedure.query(async ({ ctx }) => {
      const verifiedEmail = await getLatestVerifiedEmail(ctx.user.id);
      return {
        isVerified: verifiedEmail !== null,
        email: verifiedEmail
      };
    })
  }),
  compliance: router({
    getLatestTerms: publicProcedure.query(async () => {
      const termsVersion = await getLatestTermsVersion();
      if (!termsVersion) {
        throw new Error("Terms of Service not found");
      }
      return {
        id: termsVersion.id,
        version: termsVersion.version,
        title: termsVersion.title,
        effectiveDate: termsVersion.effectiveDate
      };
    }),
    acceptTerms: protectedProcedure.input(z8.object({ termsVersionId: z8.number() })).mutation(async ({ ctx, input }) => {
      try {
        const ipAddress = ctx.req.headers["x-forwarded-for"] || ctx.req.socket.remoteAddress || void 0;
        await recordTermsAcceptance(ctx.user.id, input.termsVersionId, ipAddress);
        return { success: true, message: "Terms accepted" };
      } catch (error) {
        console.error("[Terms Acceptance] Error:", error);
        throw new Error("Failed to record terms acceptance");
      }
    }),
    hasAcceptedLatestTerms: protectedProcedure.query(async ({ ctx }) => {
      const latestTerms = await getLatestTermsVersion();
      if (!latestTerms) return false;
      const accepted = await hasUserAcceptedTermsVersion(ctx.user.id, latestTerms.id);
      return accepted;
    })
  }),
  decisionTree: decisionTreeRouter,
  pickAndWin: pickAndWinRouter,
  feedback: feedbackRouter,
  retention: retentionRouter,
  coach: coachRouter,
  payments: paymentsRouter
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid as nanoid2 } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime()
];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = path2.resolve(process.cwd(), "dist", "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/stripe-webhook.ts
init_db();
init_schema();
import Stripe3 from "stripe";
import { eq as eq2 } from "drizzle-orm";
var stripe3 = new Stripe3(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover"
});
async function handleStripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  if (!sig) {
    console.error("[Webhook] No signature provided");
    return res.status(400).send("No signature");
  }
  let event;
  try {
    event = stripe3.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }
  console.log("[Webhook] Processing event:", event.type, event.id);
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const customerEmail = session.customer_email || session.metadata?.customer_email;
        if (!userId) {
          console.error("[Webhook] No user_id in session metadata");
          return res.status(400).send("Missing user_id");
        }
        console.log(`[Webhook] Payment successful for user ${userId}`);
        const db = await getDb();
        if (!db) {
          console.error("[Webhook] Database not available");
          return res.status(500).send("Database error");
        }
        await db.update(users).set({
          isPremium: 1,
          // 1 = true for MySQL boolean
          stripeCustomerId: session.customer,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(users.id, parseInt(userId)));
        console.log(`[Webhook] User ${userId} upgraded to premium`);
        break;
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("[Webhook] Payment intent succeeded:", paymentIntent.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.error("[Webhook] Payment failed:", paymentIntent.id);
        break;
      }
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
    return res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    return res.status(500).send(`Webhook processing error: ${error.message}`);
  }
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use((req, res, next) => {
    const host = req.get("host") || "";
    const hostWithoutPort = host.split(":")[0];
    if (hostWithoutPort === "dopaminedasher.com") {
      const protocol = req.protocol || "https";
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      return res.redirect(301, `${protocol}://www.dopaminedasher.com${req.originalUrl}`);
    }
    next();
  });
  app.post("/api/stripe/webhook", express2.raw({ type: "application/json" }), handleStripeWebhook);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
