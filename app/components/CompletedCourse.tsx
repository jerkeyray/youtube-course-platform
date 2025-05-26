import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Course, Certificate } from "@prisma/client";

interface CompletedCourseProps {
  course: Course & {
    certificates: Certificate[];
  };
}

export function CompletedCourse({ course }: CompletedCourseProps) {
  const certificate = course.certificates[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{course.title}</span>
          <span className="text-sm text-muted-foreground">Completed</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {certificate?.imageUrl ? (
          <Button asChild variant="outline" className="w-full">
            <a
              href={certificate.imageUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </a>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Certificate not available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
