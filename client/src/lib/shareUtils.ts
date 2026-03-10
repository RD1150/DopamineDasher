/**
 * Share utilities for generating social media share URLs and messages
 */

export interface ShareData {
  taskTitle: string;
  taskDescription?: string;
  timeSpent?: number; // in seconds
  streakCount?: number;
  customMessage?: string;
}

/**
 * Generate a default share message based on task data
 */
export function generateShareMessage(data: ShareData): string {
  let message = `Just completed: "${data.taskTitle}"`;

  if (data.timeSpent) {
    const minutes = Math.round(data.timeSpent / 60);
    message += ` in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  if (data.streakCount && data.streakCount > 0) {
    message += ` 🔥 ${data.streakCount}-day streak`;
  }

  message += ` with Dopamine Dasher — a micro-action app for ADHD brains.`;
  return message;
}

/**
 * Generate Twitter/X share URL
 */
export function generateTwitterShareUrl(message: string, url: string = "https://www.dopaminedasher.com"): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`;
}

/**
 * Generate LinkedIn share URL
 */
export function generateLinkedInShareUrl(
  taskTitle: string,
  message: string,
  url: string = "https://www.dopaminedasher.com"
): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(`I just completed: ${taskTitle}`)}&summary=${encodeURIComponent(message)}`;
}

/**
 * Generate Facebook share URL
 */
export function generateFacebookShareUrl(message: string, url: string = "https://www.dopaminedasher.com"): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`;
}

/**
 * Open share URL in a new window
 */
export function openShareWindow(url: string, width: number = 600, height: number = 400): Window | null {
  return window.open(url, "_blank", `width=${width},height=${height}`);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
}

/**
 * Generate referral URL with user ID
 */
export function generateReferralUrl(userId: string): string {
  return `https://www.dopaminedasher.com?ref=${userId}`;
}

/**
 * Track share event (can be used with analytics)
 */
export interface ShareEvent {
  platform: "twitter" | "linkedin" | "facebook" | "clipboard";
  taskTitle: string;
  timestamp: number;
  timeSpent?: number;
  streakCount?: number;
}

export function trackShareEvent(event: ShareEvent): void {
  // This can be connected to your analytics system
  console.log("[Share Event]", event);
}
