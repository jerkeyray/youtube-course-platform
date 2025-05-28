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
        "Zero days? The Yudoku Yeti's puking at your laziness. Start a course, you slug! 😖",
      shareText: "Starting my Yudoku streak from nothing. Bet I'll crush it.",
    },
    {
      message:
        "No streak? The Yudoku Yeti's burning your couch. Learn now, deadbeat! 😖",
      shareText: "Zero days on Yudoku. Gotta dodge the Yeti's stink-eye.",
    },
    {
      message:
        "Zilch? You're the Yudoku Yeti's biggest letdown. Study, you wreck! 😿",
      shareText: "From zero to Yudoku king. Watch this.",
    },
    {
      message:
        "Zero? The Yudoku Yeti's stealing your snacks. Get to work, flop! 😤",
      shareText: "Yudoku streak at zero. Time to shut the Yeti up.",
    },
  ],
  "1-6": [
    {
      message:
        "{streak} days? The Yudoku Yeti's snoring. Move faster, you turtle! 😾",
      shareText: "{streak} days on Yudoku. Just warming up.",
    },
    {
      message:
        "{streak} days? The Yudoku Yeti bets you'll quit. Prove it wrong, chump! 😒",
      shareText: "{streak}-day Yudoku streak. I'm not backing down.",
    },
    {
      message:
        "Only {streak} days? The Yudoku Yeti's mocking you. Get serious, goof! 😖",
      shareText: "{streak} days of Yudoku. The Yeti's got nothing on me.",
    },
    {
      message:
        "{streak} days? The Yudoku Yeti's embarrassed for you. Hustle, slob! 😼",
      shareText: "{streak}-day streak on Yudoku. Get ready for more.",
    },
  ],
  "7-9": [
    {
      message:
        "{streak} days? The Yudoku Yeti's barely awake. Don't bomb it, dweeb! 💪",
      shareText: "{streak} days on Yudoku. I'm starting to roll.",
    },
    {
      message:
        "{streak} days? The Yudoku Yeti's not impressed yet. I'm not done yet! 😤",
      shareText: "{streak}-day Yudoku streak. No stopping now.",
    },
    {
      message:
        "{streak} days? The Yudoku Yeti's seen better. Step up, loser! 😼",
      shareText: "{streak} days of Yudoku. I'm outpacing the Yeti.",
    },
    {
      message:
        "{streak} days? The Yudoku Yeti's itching to roast you. Don't slip! 😤",
      shareText: "{streak}-day streak on Yudoku. Yeti's got no chance.",
    },
  ],
  "10": [
    {
      message:
        "10 days! The Yudoku Yeti's almost impressed. Don't choke, hotshot! 😎",
      shareText: "10 days of Yudoku. I'm running this game.",
    },
    {
      message:
        "10 days? The Yudoku Yeti didn't think you'd last. Keep going, freak! 😤",
      shareText: "10-day Yudoku streak. The Yeti's impressed.",
    },
    {
      message:
        "10 days! The Yudoku Yeti's giving side-eye. Stay tough, or get burned! 😈",
      shareText: "10 days on Yudoku. I'm owning it.",
    },
    {
      message: "10 days? The Yudoku Yeti's stunned. Don't flake now, boss! 😏",
      shareText: "10-day streak on Yudoku. Yeti's eating my dust.",
    },
  ],
  "11-29": [
    {
      message:
        "{streak} days? The Yudoku Yeti's nervous. Don't crash, you beast! 😤",
      shareText: "{streak}-day Yudoku streak. I'm unstoppable.",
    },
    {
      message: "{streak} days? The Yudoku Yeti's hiding. You're a menace! 😈",
      shareText: "{streak} days on Yudoku. I'm the Yeti's nightmare.",
    },
    {
      message:
        "{streak} days? You're scaring the Yudoku Yeti. Don't quit, terror! 😼",
      shareText: "{streak}-day streak on Yudoku. Yeti's outmatched.",
    },
    {
      message:
        "{streak} days? The Yudoku Yeti's toast. Stay savage, you animal! 💪",
      shareText: "{streak} days of Yudoku. I'm crushing it.",
    },
  ],
  "30+": [
    {
      message:
        "{streak} days?! The Yudoku Yeti's unemployed. You're a god, jerk! 😏",
      shareText: "{streak} days of Yudoku. I'm the king of this.",
    },
    {
      message:
        "{streak} days? The Yudoku Yeti's retired. You're a tyrant, freak! 😤",
      shareText: "{streak}-day Yudoku streak. I'm a legend.",
    },
    {
      message:
        "{streak} days?! The Yudoku Yeti's irrelevant. Rule forever, monster! 😎",
      shareText: "{streak} days on Yudoku. I'm rewriting the rules.",
    },
    {
      message:
        "{streak} days? The Yudoku Yeti's extinct. You're unstoppable, creep! 😼",
      shareText: "{streak}-day streak on Yudoku. I'm the boss.",
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
