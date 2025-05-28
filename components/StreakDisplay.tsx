"use client";

import { useEffect, useState, useCallback } from "react";
import { Flame, Share2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Define streak message ranges with Duolingo-inspired, offensive, Yudoku Yeti text
interface StreakMessage {
  message: string;
  shareText: string;
}
interface StreakMessages {
  [key: string]: StreakMessage[];
}
const streakMessages: StreakMessages = {
  "0": [
    {
      message:
        "0 days? That Udemy course you bought in 2022 is still waiting. So is your future. 📉",
      shareText: "Starting from rock bottom. No excuses now.",
    },
    {
      message:
        "Zero? You binge Netflix but can't finish a 10-min lesson? Disgraceful. 🍿🧠",
      shareText: "Zero-day streak. Time to stop pretending to be productive.",
    },
    {
      message:
        "Still 0? You're one TED Talk away from delusion. Watch a real course, clown. 🎭",
      shareText: "No streak yet. I’m finally doing something real.",
    },
    {
      message:
        "0 days. Your brain's buffering while your career's stuck on a 404. 🧠💀",
      shareText: "Day zero. Time to load something useful.",
    },
  ],
  "1-6": [
    {
      message:
        "{streak} days? Cool. Still not enough to explain anything without Googling. 🫠",
      shareText: "{streak}-day streak. Baby steps away from cluelessness.",
    },
    {
      message:
        "{streak} days in, and you're still afraid of the 'Advanced' tab. Push harder. 📚",
      shareText: "{streak} days of learning. Fear of progress decreasing.",
    },
    {
      message:
        "{streak} days? You’ve outlasted your last gym phase. Keep showing up. 🏋️‍♂️",
      shareText: "{streak}-day streak. I'm doing better than my New Year's goals.",
    },
    {
      message:
        "{streak} days? Better than nothing, but your brain still autoplays distractions. 🤡",
      shareText: "{streak} days in. Let's see how far this goes.",
    },
  ],
  "7-9": [
    {
      message:
        "{streak} days? You’re approaching dangerous levels of actual commitment. 🔥",
      shareText: "{streak} days strong. Finally sticking to something.",
    },
    {
      message:
        "{streak} days? Your attention span’s evolving. TikTok’s losing. 📉",
      shareText: "{streak}-day streak. Learning over doomscrolling.",
    },
    {
      message:
        "{streak} days? Your old self just rage-quit. Keep going, killer. 💀📘",
      shareText: "{streak}-day streak. Feels illegal to be this focused.",
    },
    {
      message:
        "{streak} days? Not bad. But your course tab is still next to YouTube. Be careful. 🕵️‍♂️",
      shareText: "{streak} days of learning. I might actually finish something.",
    },
  ],
  "10": [
    {
      message:
        "10 days?! That’s longer than most tech bootcamps' refund window. 😎",
      shareText: "10-day streak. No refund needed, I’m locked in.",
    },
    {
      message:
        "10 days of showing up? Your procrastination demon is on life support. 🫀⚔️",
      shareText: "Day 10. Procrastination’s taking Ls.",
    },
    {
      message:
        "10 days? Finally learning instead of pretending to be productive on Notion. 📓",
      shareText: "10 days of actual learning. Sorry, aesthetic dashboards.",
    },
    {
      message:
        "10 days? You're officially more disciplined than 90% of Twitter gurus. 📉",
      shareText: "10-day streak. No threads, just learning.",
    },
  ],
  "11-29": [
    {
      message:
        "{streak} days? You’ve broken past tutorial attention span. Welcome to the real grind. ⚙️",
      shareText: "{streak}-day streak. I don’t just start—I finish.",
    },
    {
      message:
        "{streak} days? Your self-doubt’s googling 'how to handle success'. 💻",
      shareText: "{streak} days into my course journey. Brain’s sweating.",
    },
    {
      message:
        "{streak} days? You’re officially smarter than whoever named 'JavaScript'. ☕",
      shareText: "{streak} days strong. Clarity approaching.",
    },
    {
      message:
        "{streak} days? At this point, even your chair respects you. 🪑💯",
      shareText: "{streak} days in. Me and the grind are friends now.",
    },
  ],
  "30+": [
    {
      message:
        "{streak} days?! That’s not a streak—that’s a personality. You beast. 🧠🔥",
      shareText: "{streak}-day streak. Learning is now my religion.",
    },
    {
      message:
        "{streak} days? You just lapped your past self and stole their dreams. 🎯",
      shareText: "{streak} days of pure focus. Nothing fake here.",
    },
    {
      message:
        "{streak} days? The algorithm can’t even distract you anymore. You broke free. 🚫📱",
      shareText: "{streak} days in. I’m immune to noise.",
    },
    {
      message:
        "{streak} days? You’re a machine. Course platforms are scared of how much you're learning. 🤖",
      shareText: "{streak} days strong. I might actually be unstoppable now.",
    },
  ],
};


// Randomly select a message from the range
function getStreakMessage(streak: number) {
  let range: string;
  if (streak === 0) range = "0";
  else if (streak <= 6) range = "1-6";
  else if (streak <= 9) range = "7-9";
  else if (streak === 10) range = "10";
  else if (streak <= 29) range = "11-29";
  else range = "30+";
  const messages = streakMessages[range];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  // Replace {streak} in message/shareText
  return {
    message: msg.message.replace("{streak}", streak.toString()),
    shareText: msg.shareText.replace("{streak}", streak.toString()),
  };
}

interface StreakSectionProps {
  className?: string;
}

export function StreakSection({ className }: StreakSectionProps) {
  const { user, isLoaded } = useUser();
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch streak from API
  const fetchStreak = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/user/streak");
      if (!response.ok) throw new Error("Failed to fetch streak");
      const data = await response.json();
      setStreak(data.currentStreak || 0);
    } catch (error) {
      console.error("Error fetching streak:", error);
      setStreak(0);
      toast.error("Streak fetch failed. Zero it is, you slouch!");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchStreak();
    }
  }, [isLoaded, user, fetchStreak]);

  if (!isLoaded || isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 text-lg text-muted-foreground font-bold animate-pulse",
          className
        )}
      >
        <Flame className="h-8 w-8 text-blue-500" />
        <span>Loading...</span>
      </div>
    );
  }

  const { message } = getStreakMessage(streak);

  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 text-blue-600 bg-blue-50 px-6 py-4 rounded-xl shadow-md border border-blue-300 transition-transform hover:scale-105",
        className
      )}
      role="region"
      aria-label="Learning Streak"
    >
      <div className="flex items-center gap-3 text-2xl font-extrabold">
        <Flame className="h-10 w-10 text-blue-500" />
        <span>
          {streak} day{streak !== 1 ? "s" : ""} streak
        </span>
      </div>
      <span className="text-lg font-semibold text-blue-700">{message}</span>
    </div>
  );
}

export default StreakSection;
