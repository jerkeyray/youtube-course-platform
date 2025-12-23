"use client";

import React, { useState } from "react";
import Link from "next/link";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import { StreakDisplay } from "@/components/StreakDisplay";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Play,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

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

  let heatmapContextString = "Activity over time.";
  if (thisWeekCount > lastWeekCount) {
      heatmapContextString = `Activity this week.`;
  } else if (thisWeekCount < lastWeekCount && lastWeekCount > 0) {
      heatmapContextString = `Activity this week.`;
  } else if (thisWeekCount === lastWeekCount && thisWeekCount > 0) {
      heatmapContextString = "Activity over time.";
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
            isUrgent: daysRemaining <= 3 && daysRemaining >= 0
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
    .slice(0, 3); // Reduced from 4 to 3 for balance

  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="space-y-10 p-6 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between">
            {/* Minimal Header */}
            <div />
             <Button variant="ghost" className="gap-2 text-neutral-400 hover:text-white" asChild>
                <Link href="/dashboard/courses/create">
                    <Plus size={16} />
                    <span>Add Course</span>
                </Link>
            </Button>
        </div>

        {/* 1. DOMINANT PRIMARY ACTION */}
        {nextTask ? (
            <div className="w-full">
                <Link 
                    href={`/dashboard/courses/${nextTask.courseId}?videoId=${nextTask.videoId}`}
                    className="block focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black rounded-2xl"
                >
                    <div className="group relative overflow-hidden rounded-2xl bg-[#0D1016] border-2 border-white/10 hover:border-white/30 focus-within:border-white/30 transition-all duration-300 p-8 sm:p-12 cursor-pointer shadow-2xl hover:shadow-white/5 active:scale-[0.998]">
                        {/* Background subtle effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative z-10 flex flex-col items-start gap-6">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black group-hover:scale-110 transition-transform duration-300">
                                    <Play size={14} fill="currentColor" />
                                </span>
                                <span className="text-white font-semibold tracking-wider text-sm uppercase">Resume</span>
                            </div>
                            
                            <div className="space-y-3 w-full">
                                <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-tight">
                                    {nextTask.videoTitle}
                                </h2>
                                <p className="text-sm text-neutral-500 font-normal">
                                    {nextTask.courseTitle}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-neutral-600 mt-1">
                                <span className="text-xs font-normal flex items-center gap-1.5">
                                    {nextTask.remainingInCourse} remaining
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        ) : (
             <div className="bg-[#0D1016] rounded-xl p-12 border border-white/5 text-center">
                 <h2 className="text-2xl font-medium text-white mb-2">Ready to start learning?</h2>
                 <p className="text-neutral-400 mb-8 font-light">Add your first YouTube course to get started.</p>
                 <Button asChild className="bg-white text-black hover:bg-neutral-200 px-8 h-12 text-base border-0">
                    <Link href="/dashboard/courses/create">Create Course</Link>
                 </Button>
             </div>
        )}

        {/* 2. CRITICAL DEADLINES (Forward Looking) */}
        {coursesWithDeadlines.length > 0 && (
            <div className="space-y-3">
                <h3 className="text-base font-medium text-neutral-400">Priorities</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {coursesWithDeadlines.map((course) => (
                         <Link key={course.id} href={`/dashboard/courses/${course.id}`} className="block h-full">
                            <div className={`h-full flex flex-col justify-between p-4 rounded-lg border transition-all duration-200 ${
                                course.isUrgent 
                                ? "bg-[#0D1016] border-orange-500/20 hover:border-orange-500/30" 
                                : "bg-[#0D1016] border-white/5 hover:border-white/8"
                            }`}>
                                <div>
                                    <h4 className="text-sm font-medium text-neutral-300 mb-1 line-clamp-1">{course.title}</h4>
                                    <div className="flex items-baseline gap-2">
                                         <span className={`text-xl font-medium ${course.isUrgent ? "text-orange-400" : "text-neutral-400"}`}>
                                            {course.daysRemaining <= 0 ? "Due" : course.daysRemaining}
                                        </span>
                                        <span className="text-xs text-neutral-600">
                                            {course.daysRemaining <= 0 ? "today" : "days left"}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="mt-3 pt-3 border-t border-white/5">
                                    <p className="text-xs text-neutral-500">
                                        {course.isUrgent 
                                            ? "Continue today." 
                                            : "Continue when ready."}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}

        {/* 3. SECONDARY ACTIONS (Library / History) */}
        {(recentlyWatchedVideos.length > 0 || courses.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Recently Watched List */}
                 {recentlyWatchedVideos.length > 0 && (
                    <div>
                        <h3 className="text-base font-medium text-neutral-400 mb-3">Recent</h3>
                        <div className="space-y-1.5">
                            {recentlyWatchedVideos.map((video) => (
                                 <Link
                                    key={video.id}
                                    href={`/dashboard/courses/${video.courseId}?videoId=${video.id}`}
                                    className="block group"
                                 >
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-[#0D1016] hover:bg-white/5 hover:border-white/8 transition-all duration-200">
                                        <div className="overflow-hidden mr-4">
                                            <h4 className="text-sm font-normal text-neutral-300 group-hover:text-neutral-200 truncate">{video.title}</h4>
                                            <p className="text-xs text-neutral-600 truncate mt-0.5">{video.courseTitle}</p>
                                        </div>
                                        <Play size={12} className="text-neutral-700 group-hover:text-neutral-500 transition-colors shrink-0" />
                                    </div>
                                 </Link>
                            ))}
                        </div>
                    </div>
                 )}
                 
                 {/* Simple Library Link */}
                 {courses.length > 0 && (
                    <div>
                        <h3 className="text-base font-medium text-neutral-400 mb-3">Library</h3>
                         <Link href="/dashboard/mycourses" className="block group h-full">
                            <div className="h-full flex flex-col justify-center items-center p-5 rounded-lg border border-white/5 bg-[#0D1016] hover:bg-white/5 hover:border-white/8 transition-all duration-200 text-center">
                                <span className="text-neutral-300 font-normal mb-1 group-hover:text-neutral-200">View All Courses</span>
                                <span className="text-xs text-neutral-600">Access your full collection</span>
                            </div>
                         </Link>
                    </div>
                 )}
            </div>
        )}

        {/* 4. ANALYTICS (Demoted) */}
        <div className="pt-6 border-t border-white/5">
            <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between p-0 hover:bg-transparent text-neutral-600 hover:text-neutral-400 font-normal group"
                onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
            >
                <span className="text-sm">Activity History</span>
                <div className="bg-neutral-900 rounded-full p-1 text-neutral-600 group-hover:text-neutral-400 transition-colors">
                    {isAnalyticsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
            </Button>
            
            {isAnalyticsOpen && (
                 <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-8 bg-[#0D1016] rounded-lg p-5 border border-white/5">
                             <div className="w-full overflow-x-auto pb-2">
                                 <ActivityHeatmap activities={activities} cellSize={12} />
                            </div>
                            <p className="text-xs text-neutral-600 mt-3 font-normal">
                                {heatmapContextString}
                            </p>
                        </div>
                        <div className="lg:col-span-4">
                            <StreakDisplay activities={activities} />
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
