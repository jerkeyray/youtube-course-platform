import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Course } from "@/components/CourseCard";

export function useCourses() {
  const queryClient = useQueryClient();

  // Query to fetch all courses
  const {
    data: courses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await fetch("/api/courses");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await response.json();
      return data.courses;
    },
  });

  // Mutation to delete a course
  const { mutate: deleteCourse } = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      return courseId;
    },
    onSuccess: (deletedCourseId) => {
      // Update the cache by filtering out the deleted course
      queryClient.setQueryData(["courses"], (oldData: Course[] = []) =>
        oldData.filter((course) => course.id !== deletedCourseId),
      );
    },
  });

  return {
    courses,
    isLoading,
    error: error ? (error as Error).message : null,
    deleteCourse,
  };
}
