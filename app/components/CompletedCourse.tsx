"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface CompletedCourseProps {
  course: {
    id: string;
    title: string;
    completedAt: string;
  };
}

export function CompletedCourse({ course }: CompletedCourseProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{course.title}</h3>
            <p className="text-sm text-muted-foreground">
              Completed on{" "}
              {format(new Date(course.completedAt), "MMMM d, yyyy")}
            </p>
          </div>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
      </CardContent>
    </Card>
  );
}
