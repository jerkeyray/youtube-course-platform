"use client";

import { useEffect, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type ChapterForSheet = {
  id: string;
  title: string;
  startSeconds: number;
  endSeconds: number;
  order: number;
  progress?: Array<{ completed: boolean }>;
};

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ChaptersSheet({
  open,
  onOpenChange,
  chapters,
  currentChapterIndex,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapters: ChapterForSheet[];
  currentChapterIndex: number;
}) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    for (const ch of chapters) {
      if (ch.progress?.some((p) => p.completed)) ids.add(ch.id);
    }
    return ids;
  });

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      const { chapterId, completed } = event.detail as {
        chapterId: string;
        completed: boolean;
      };
      if (!chapterId) return;
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (completed) next.add(chapterId);
        else next.delete(chapterId);
        return next;
      });
    };

    window.addEventListener("chapterProgressUpdate", handler as EventListener);
    return () =>
      window.removeEventListener(
        "chapterProgressUpdate",
        handler as EventListener
      );
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0">
        <SheetHeader className="px-4 pt-4 pb-3">
          <SheetTitle>Chapters</SheetTitle>
        </SheetHeader>

        <ScrollArea className="max-h-[60vh] px-0 pb-4">
          <div className="px-2">
            {chapters
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((ch, index) => {
                const isActive = index === currentChapterIndex;
                const isCompleted = completedIds.has(ch.id);

                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("chapterIndexChange", {
                          detail: { chapterIndex: index, source: "user" },
                        })
                      );
                      onOpenChange(false);
                    }}
                    className={cn(
                      "w-full relative text-left transition-colors rounded-md",
                      isActive ? "bg-white/10" : "hover:bg-white/5"
                    )}
                    title={ch.title}
                  >
                    <div className="flex items-start gap-3 px-3 py-2.5">
                      <div className="flex-shrink-0 pt-[2px]">
                        {isCompleted ? (
                          <Check
                            className={cn(
                              "h-3.5 w-3.5",
                              isActive ? "text-white/80" : "text-neutral-500"
                            )}
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-500">
                            {formatTime(ch.startSeconds)}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "line-clamp-2 leading-snug text-sm",
                            isActive
                              ? "text-white font-semibold"
                              : isCompleted
                              ? "text-neutral-500"
                              : "text-neutral-400"
                          )}
                        >
                          {ch.title}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
