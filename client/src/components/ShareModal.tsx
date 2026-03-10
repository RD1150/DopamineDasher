import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Share2, Twitter, Linkedin, Facebook, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  taskDescription?: string;
  timeSpent?: number; // in seconds
  streakCount?: number;
}

export function ShareModal({
  isOpen,
  onClose,
  taskTitle,
  taskDescription,
  timeSpent,
  streakCount,
}: ShareModalProps) {
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate default share message
  const generateDefaultMessage = () => {
    let message = `Just completed: "${taskTitle}"`;

    if (timeSpent) {
      const minutes = Math.round(timeSpent / 60);
      message += ` in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }

    if (streakCount && streakCount > 0) {
      message += ` 🔥 ${streakCount}-day streak`;
    }

    message += ` with Dopamine Dasher — a micro-action app for ADHD brains.`;
    return message;
  };

  const shareMessage = customMessage || generateDefaultMessage();
  const shareUrl = `https://www.dopaminedasher.com`;

  // Social media share URLs
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`I just completed: ${taskTitle}`)}&summary=${encodeURIComponent(shareMessage)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`,
  };

  const handleShare = (platform: "twitter" | "linkedin" | "facebook") => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Win
          </DialogTitle>
          <DialogDescription>
            Celebrate your accomplishment and inspire others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Section */}
          <div className="bg-muted p-4 rounded-lg border border-border">
            <p className="text-sm font-medium text-foreground mb-2">
              Preview:
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {shareMessage}
            </p>
          </div>

          {/* Custom Message Input */}
          <div className="space-y-2">
            <label htmlFor="custom-message" className="text-sm font-medium">
              Customize your message (optional)
            </label>
            <Textarea
              id="custom-message"
              placeholder="Write your own message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-24 resize-none"
            />
          </div>

          {/* Social Media Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Share on:</p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={() => handleShare("twitter")}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Twitter className="w-4 h-4" />
                Share on Twitter/X
              </Button>
              <Button
                onClick={() => handleShare("linkedin")}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Linkedin className="w-4 h-4" />
                Share on LinkedIn
              </Button>
              <Button
                onClick={() => handleShare("facebook")}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Facebook className="w-4 h-4" />
                Share on Facebook
              </Button>
            </div>
          </div>

          {/* Copy to Clipboard */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Or copy to clipboard:</p>
            <div className="flex gap-2">
              <Input
                value={shareMessage}
                readOnly
                className="text-sm"
              />
              <Button
                onClick={handleCopyToClipboard}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Close Button */}
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
