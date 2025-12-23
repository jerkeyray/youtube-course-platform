"use client";

import React from "react";
import Link from "next/link";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import CourseCard from "@/components/CourseCard";
import { StreakDisplay } from "@/components/StreakDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  Flame,
  Plus,
  Video,
  ArrowUpRight,
  TrendingUp,
  Target,
  Play,
  AlertCircle,
  BarChart,
} from "lucide-react";
import { format, differenceInDays, subWeeks, isSameWeek, parseISO } from "date-fns";

interface SerializedCourse {
  id: string;
  title: string;
  playlistId: string;
  userId: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  videos: Array<{
    id: string;
    title: string;
    videoId: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    progress: Array<{
      id: string;
      userId: string;
      videoId: string;
      completed: boolean;
      updatedAt: string;
    }>;
  }>;
}

// Match the ActivityHeatmap component's interface
interface Activity {
  id: string;
  userId: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardClientProps {
  courses: SerializedCourse[];
  activities: Activity[];
}

export default function DashboardClient({
  courses,
  activities,
}: DashboardClientProps) {
  // --- LOGIC: Dominant "Continue" Card ---
  // Find the most relevant course to continue
  let nextTask: {
    courseId: string;
    courseTitle: string;
    videoTitle: string;
    videoId: string;
    remainingInCourse: number;
  } | null = null;

  // Flatten video progress to find the absolute most recent activity
  const allProgress = courses
    .flatMap(c => c.videos.map(v => ({ course: c, video: v, progress: v.progress[0] })))
    .filter(item => item.progress)
    .sort((a, b) => new Date(b.progress.updatedAt).getTime() - new Date(a.progress.updatedAt).getTime());

  if (allProgress.length > 0) {
    const mostRecent = allProgress[0];
    const course = mostRecent.course;
    
    // Find first uncompleted video in this course
    const uncompletedVideo = course.videos.sort((a, b) => a.order - b.order).find(v => !v.progress.some(p => p.completed));
    
    if (uncompletedVideo) {
      const remaining = course.videos.filter(v => !v.progress.some(p => p.completed)).length;
      nextTask = {
        courseId: course.id,
        courseTitle: course.title,
        videoTitle: uncompletedVideo.title,
        videoId: uncompletedVideo.id,
        remainingInCourse: remaining
      };
    } else {
        // If course is finished, maybe look for the next most recent course?
        // For now, let's just pick the next course in the list that isn't finished.
        const nextCourse = courses.find(c => c.videos.some(v => !v.progress.some(p => p.completed)));
         if (nextCourse) {
            const nextVideo = nextCourse.videos.sort((a, b) => a.order - b.order).find(v => !v.progress.some(p => p.completed));
            if (nextVideo) {
                 const remaining = nextCourse.videos.filter(v => !v.progress.some(p => p.completed)).length;
                nextTask = {
                    courseId: nextCourse.id,
                    courseTitle: nextCourse.title,
                    videoTitle: nextVideo.title,
                    videoId: nextVideo.id,
                    remainingInCourse: remaining
                };
            }
        }
    }
  } else if (courses.length > 0) {
      // No progress yet, pick the first course
      const course = courses[0];
      const video = course.videos.sort((a,b) => a.order - b.order)[0];
      if (video) {
        nextTask = {
            courseId: course.id,
            courseTitle: course.title,
            videoTitle: video.title,
            videoId: video.id,
            remainingInCourse: course.videos.length
        };
      }
  }

  // --- LOGIC: Heatmap Context ---
  // Compare this week's activity vs last week
  const today = new Date();
  
  // Last 7 days vs previous 7 days
  const last7Days = activities.filter(a => differenceInDays(today, parseISO(a.date)) < 7 && differenceInDays(today, parseISO(a.date)) >= 0);
  const previous7Days = activities.filter(a => differenceInDays(today, parseISO(a.date)) >= 7 && differenceInDays(today, parseISO(a.date)) < 14);

  const thisWeekCount = last7Days.filter(a => a.completed).length;
  const lastWeekCount = previous7Days.filter(a => a.completed).length;

  let heatmapContextString = "Consistent effort builds mastery.";
  if (thisWeekCount > lastWeekCount) {
      heatmapContextString = `You studied more this week than last. Great momentum.`;
  } else if (thisWeekCount < lastWeekCount && lastWeekCount > 0) {
      const drop = Math.round(((lastWeekCount - thisWeekCount) / lastWeekCount) * 100);
      heatmapContextString = `You studied ${drop}% less this week than last.`;
  } else if (thisWeekCount === lastWeekCount && thisWeekCount > 0) {
      heatmapContextString = "You're maintaining a steady pace compared to last week.";
  }

  // --- LOGIC: Deadlines with Teeth ---
  const coursesWithDeadlines = courses
    .filter((course) => course.deadline)
    .map(course => {
        const totalVideos = course.videos.length;
        const completedVideos = course.videos.filter(v => v.progress.some(p => p.completed)).length;
        const remainingVideos = totalVideos - completedVideos;
        
        if (remainingVideos === 0) return null; // Skip completed courses

        const deadlineDate = new Date(course.deadline!);
        const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate required pace
        // If daysRemaining is <= 0 and remainingVideos > 0, pace is infinite/urgent
        const pace = daysRemaining > 0 ? (remainingVideos / daysRemaining).toFixed(1) : remainingVideos; // videos per day
        
        return {
            ...course,
            daysRemaining,
            remainingVideos,
            pace: Number(pace),
            isUrgent: daysRemaining <= 3
        };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 3); // Top 3 urgent

  // --- LOGIC: Recently Watched (History) ---
  const recentlyWatchedVideos = courses
    .flatMap((course) =>
      course.videos
        .filter((video) => video.progress.length > 0)
        .map((video) => ({
          id: video.id,
          title: video.title,
          videoId: video.id,
          courseId: course.id,
          courseTitle: course.title,
          updatedAt: video.progress[0].updatedAt,
        }))
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Dashboard
            </h1>
            <p className="text-neutral-400 mt-1 font-light">Focus on what matters.</p>
          </div>
          <Button className="gap-2 bg-white text-black hover:bg-neutral-200 transition-all duration-200 rounded-md h-10 px-4 font-medium border-0">
            <Plus size={16} />
            <Link href="/dashboard/courses/create">Add Course</Link>
          </Button>
        </div>

        {/* 1. DOMINANT CONTINUE CARD */}
        {nextTask ? (
            <div className="w-full">
                <Link href={`/dashboard/courses/${nextTask.courseId}?videoId=${nextTask.videoId}`}>
                    <div className="group relative overflow-hidden rounded-xl bg-[#0D1016] border border-white/10 hover:border-white/20 transition-all duration-300 p-8 cursor-pointer shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Play size={120} className="text-white" fill="currentColor" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-white/70 mb-3 font-medium tracking-wide text-xs uppercase">
                                <span className="flex items-center gap-1"><Video size={14}/> Continue Learning</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white mb-2 group-hover:text-neutral-200 transition-colors">
                                {nextTask.courseTitle}
                            </h2>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-neutral-400 mt-6">
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                                    <Target className="text-white h-3.5 w-3.5"/>
                                    <span className="font-mono text-sm text-neutral-300">Next: {nextTask.videoTitle}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                                    <BarChart className="text-white h-3.5 w-3.5"/>
                                    <span className="font-mono text-sm text-neutral-300">{nextTask.remainingInCourse} lessons remaining</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        ) : (
             <div className="bg-[#0D1016] rounded-xl p-8 border border-white/5 text-center">
                 <h2 className="text-2xl font-medium text-white mb-2">Ready to start?</h2>
                 <p className="text-neutral-400 mb-6 font-light">You don't have any active courses. Add one to get started.</p>
                 <Button asChild className="bg-white text-black hover:bg-neutral-200 border-0">
                    <Link href="/dashboard/courses/create">Create a Course</Link>
                 </Button>
             </div>
        )}

        {/* 2. STATS & HEATMAP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             {/* Heatmap Section - Spans 8 cols */}
            <div className="lg:col-span-8 bg-[#0D1016] rounded-xl p-6 border border-white/5 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Flame className="h-5 w-5 text-white" />
                        Activity Log
                    </h3>
                    <div className="w-full overflow-x-auto pb-2">
                         <ActivityHeatmap activities={activities} cellSize={14} />
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-sm text-neutral-400 font-mono">
                        <span className="text-white font-medium mr-2">INSIGHT:</span> 
                        {heatmapContextString}
                    </p>
                </div>
            </div>

            {/* Streak Stats - Spans 4 cols */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                <StreakDisplay activities={activities} />
            </div>
        </div>

        {/* 3. DEADLINES WITH TEETH */}
        {coursesWithDeadlines.length > 0 && (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <AlertCircle className="text-white h-5 w-5" />
                    <h2 className="text-xl font-medium text-white">Critical Deadlines</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coursesWithDeadlines.map((course) => (
                         <Link key={course.id} href={`/dashboard/courses/${course.id}`} className="block h-full">
                            <div className={`h-full flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 group ${
                                course.isUrgent 
                                ? "bg-red-950/20 border-red-500/20 hover:bg-red-950/30 hover:border-red-500/30" 
                                : "bg-[#0D1016] border-white/5 hover:border-white/10"
                            }`}>
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-lg text-white group-hover:text-neutral-200 transition-colors line-clamp-1">{course.title}</h3>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            course.isUrgent ? "bg-red-500/20 text-red-400" : "bg-white/10 text-neutral-400"
                                        }`}>
                                            {course.daysRemaining <= 0 ? "Overdue" : `${course.daysRemaining} days left`}
                                        </span>
                                    </div>
                                    <div className="text-sm text-neutral-500 mt-2 font-light">
                                        <span className="text-white font-medium">{course.remainingVideos}</span> lessons remaining
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-500 uppercase tracking-wider">Required Pace</span>
                                        <span className={`font-mono font-medium ${course.isUrgent ? "text-red-400" : "text-white"}`}>
                                            {course.pace > 0 ? `${course.pace} lessons/day` : "On track"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* 4. RECENTLY WATCHED (Secondary) */}
             {recentlyWatchedVideos.length > 0 && (
                <div className="bg-[#0D1016] rounded-xl border border-white/5 p-6">
                    <h2 className="text-lg font-medium flex items-center text-neutral-300 mb-4">
                        <HistoryIcon className="h-4 w-4 mr-2" />
                        Recently Watched
                    </h2>
                    <div className="space-y-3">
                        {recentlyWatchedVideos.map((video) => (
                             <Link
                                key={video.id}
                                href={`/dashboard/courses/${video.courseId}?videoId=${video.id}`}
                                className="block"
                             >
                                <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all duration-200">
                                    <div className="overflow-hidden">
                                        <h4 className="text-sm font-medium text-white truncate">{video.title}</h4>
                                        <p className="text-xs text-neutral-500 truncate">{video.courseTitle}</p>
                                    </div>
                                    <Play size={14} className="text-neutral-600 group-hover:text-white" />
                                </div>
                             </Link>
                        ))}
                    </div>
                </div>
             )}
             
             {/* Link to all courses if not handled elsewhere */}
             <div className="bg-[#0D1016] rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                 <h2 className="text-lg font-medium text-neutral-300 mb-2">Course Library</h2>
                 <p className="text-sm text-neutral-500 mb-4 font-light">Access all your active courses and materials.</p>
                 <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white hover:text-white" asChild>
                     <Link href="/dashboard/mycourses">View All Courses</Link>
                 </Button>
             </div>
        </div>
      </main>
    </div>
  );
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12" />
        <path d="M3 3v9h9" />
        <path d="M12 7v5l4 2" />
      </svg>
    );
  }
