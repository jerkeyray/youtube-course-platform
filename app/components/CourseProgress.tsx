"use client";

import { useSession } from "next-auth/react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface CourseProgressProps {
  totalVideos: number;
  completedVideos: number;
}

export function CourseProgress({
  totalVideos,
  completedVideos,
}: CourseProgressProps) {
  const { data: session } = useSession();
  const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

  if (!session?.user) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {completedVideos} of {totalVideos} videos completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
