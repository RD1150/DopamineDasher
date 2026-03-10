import { describe, it, expect } from "vitest";
import {
  generateShareMessage,
  generateTwitterShareUrl,
  generateLinkedInShareUrl,
  generateFacebookShareUrl,
  generateReferralUrl,
} from "./shareUtils";

describe("Share Utils", () => {
  describe("generateShareMessage", () => {
    it("should generate a basic share message with task title", () => {
      const message = generateShareMessage({
        taskTitle: "Write report",
      });
      expect(message).toContain("Just completed: \"Write report\"");
      expect(message).toContain("Dopamine Dasher");
    });

    it("should include time spent in the message", () => {
      const message = generateShareMessage({
        taskTitle: "Workout",
        timeSpent: 1800, // 30 minutes
      });
      expect(message).toContain("30 minutes");
    });

    it("should handle singular minute correctly", () => {
      const message = generateShareMessage({
        taskTitle: "Quick task",
        timeSpent: 60, // 1 minute
      });
      expect(message).toContain("1 minute");
      expect(message).not.toContain("minutes");
    });

    it("should include streak count in the message", () => {
      const message = generateShareMessage({
        taskTitle: "Daily standup",
        streakCount: 5,
      });
      expect(message).toContain("5-day streak");
      expect(message).toContain("🔥");
    });

    it("should include both time and streak", () => {
      const message = generateShareMessage({
        taskTitle: "Exercise",
        timeSpent: 900, // 15 minutes
        streakCount: 10,
      });
      expect(message).toContain("15 minutes");
      expect(message).toContain("10-day streak");
    });

    it("should not include streak if streak count is 0", () => {
      const message = generateShareMessage({
        taskTitle: "Task",
        streakCount: 0,
      });
      expect(message).not.toContain("streak");
    });
  });

  describe("generateTwitterShareUrl", () => {
    it("should generate a valid Twitter share URL", () => {
      const message = "Just completed: \"Task\"";
      const url = generateTwitterShareUrl(message);
      expect(url).toContain("twitter.com/intent/tweet");
      expect(url).toContain("text=");
      expect(url).toContain("url=");
    });

    it("should encode the message properly", () => {
      const message = "Just completed: \"Task with spaces\"";
      const url = generateTwitterShareUrl(message);
      expect(url).toContain(encodeURIComponent(message));
    });

    it("should use default URL if not provided", () => {
      const message = "Test message";
      const url = generateTwitterShareUrl(message);
      expect(url).toContain("dopaminedasher.com");
    });

    it("should use custom URL if provided", () => {
      const message = "Test message";
      const customUrl = "https://custom.com";
      const url = generateTwitterShareUrl(message, customUrl);
      expect(url).toContain(encodeURIComponent(customUrl));
    });
  });

  describe("generateLinkedInShareUrl", () => {
    it("should generate a valid LinkedIn share URL", () => {
      const taskTitle = "Task";
      const message = "Just completed: \"Task\"";
      const url = generateLinkedInShareUrl(taskTitle, message);
      expect(url).toContain("linkedin.com/sharing/share-offsite");
      expect(url).toContain("url=");
      expect(url).toContain("title=");
      expect(url).toContain("summary=");
    });

    it("should encode all parameters properly", () => {
      const taskTitle = "Task with spaces";
      const message = "Message with special chars!";
      const url = generateLinkedInShareUrl(taskTitle, message);
      expect(url).toContain(encodeURIComponent(taskTitle));
      expect(url).toContain(encodeURIComponent(message));
    });
  });

  describe("generateFacebookShareUrl", () => {
    it("should generate a valid Facebook share URL", () => {
      const message = "Just completed: \"Task\"";
      const url = generateFacebookShareUrl(message);
      expect(url).toContain("facebook.com/sharer/sharer.php");
      expect(url).toContain("u=");
      expect(url).toContain("quote=");
    });

    it("should encode the message properly", () => {
      const message = "Just completed: \"Task\"";
      const url = generateFacebookShareUrl(message);
      expect(url).toContain(encodeURIComponent(message));
    });
  });

  describe("generateReferralUrl", () => {
    it("should generate a referral URL with user ID", () => {
      const userId = "user123";
      const url = generateReferralUrl(userId);
      expect(url).toContain("dopaminedasher.com");
      expect(url).toContain("ref=user123");
    });

    it("should handle different user IDs", () => {
      const userId = "abc-def-ghi";
      const url = generateReferralUrl(userId);
      expect(url).toContain("ref=abc-def-ghi");
    });
  });
});
