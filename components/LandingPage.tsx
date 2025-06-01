"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  PlayCircle,
  Star,
  ArrowRight,
  Zap,
  Target,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const { status } = useSession();
  const getStartedLink = status === "authenticated" ? "/dashboard" : "/sign-in";

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-900">
      {/* Hero Section */}
      <section className="min-h-screen px-6 py-32 text-center flex flex-col justify-center items-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/50 rounded-full text-sm text-blue-700 mb-8 shadow-lg">
            <Zap className="w-4 h-4 mr-2 text-blue-500" />
            Transform your YouTube learning experience
          </div>

          <h1 className="text-6xl md:text-8xl font-bold leading-[1.05] tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            The YouTube Course
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Experience Platform
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform any YouTube playlist into a structured, focused learning
            experience.
            <span className="font-semibold text-blue-600"> yudoku</span> removes
            distractions and keeps you focused on what matters.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full group transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              asChild
            >
              <Link href={getStartedLink} className="flex items-center gap-2">
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-10 py-6 border-2 border-gray-300 hover:border-blue-400 bg-white text-gray-800 hover:bg-blue-50 hover:text-blue-700 rounded-full transition-all duration-300"
              asChild
            >
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 sm:px-8 lg:px-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-slate-50/50"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 px-4 sm:px-0">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent leading-[1.2] py-2">
              Everything you need to learn effectively
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Simple yet powerful tools designed to transform your learning
              experience and help you achieve your goals faster.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <PlayCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Distraction-Free Player
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Watch videos in a clean, focused environment without YouTube's
                  distracting sidebar, comments, or recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Smart Progress Tracking
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Visualize your learning journey with beautiful progress
                  indicators, completion rates, and learning streaks.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Structured Courses
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Transform any playlist into an organized learning path with
                  clear objectives and milestone tracking.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Simple Process
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Get started in minutes
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              From YouTube playlist to structured course in just a few simple
              steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Sign up instantly",
                  description:
                    "Create your account with Google or email in under 30 seconds.",
                  color: "from-blue-400 to-blue-500",
                },
                {
                  step: "02",
                  title: "Add any playlist",
                  description:
                    "Paste any YouTube playlist URL and we'll structure it into a course.",
                  color: "from-green-400 to-green-500",
                },
                {
                  step: "03",
                  title: "Learn distraction-free",
                  description:
                    "Watch videos in our clean interface designed for deep learning.",
                  color: "from-purple-400 to-purple-500",
                },
                {
                  step: "04",
                  title: "Track your progress",
                  description:
                    "Monitor your learning journey and celebrate your achievements.",
                  color: "from-pink-400 to-pink-500",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-6 group">
                  <div
                    className={`flex-shrink-0 w-14 h-14 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-white/20 rounded-full"></div>
                    <div className="h-4 bg-white/15 rounded-full w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded-full w-1/2"></div>
                  </div>
                </div>
                <div className="text-center">
                  <PlayCircle className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                  <p className="text-blue-100 font-medium">
                    Your distraction-free learning environment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            Ready to transform your learning?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners who have already discovered the power of
            distraction-free education with yudoku.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-10 py-6 bg-white text-blue-600 hover:bg-gray-100 rounded-full group transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold"
              asChild
            >
              <Link href={getStartedLink} className="flex items-center gap-2">
                Start Your Journey Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            No credit card required • Free forever
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Got Questions?
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Frequently asked questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-6">
            {[
              {
                question: "Why use Yudoku instead of YouTube?",
                answer:
                  "Yudoku transforms YouTube into a focused learning platform by organizing educational content into a structured, distraction-free experience. It helps you track progress and stay on track with deadlines.",
              },
              {
                question: "How does Yudoku help me track my learning?",
                answer:
                  "Yudoku monitors your completion rates and learning streaks, keeping you motivated and aligned with your educational goals.",
              },
              {
                question: "What content works best with Yudoku?",
                answer:
                  "Yudoku is designed for public YouTube playlists, particularly educational ones like tutorials, courses, skill-building videos, and documentaries, creating a seamless learning path.",
              },
              {
                question: "How does Yudoku reduce distractions?",
                answer:
                  "Yudoku offers a clean viewing experience by removing YouTube’s sidebar, recommended videos, and comments, keeping your focus on the content that matters.",
              },
            ].map((item, index) => (
              <AccordionItem
                key={index}
                value={`q${index + 1}`}
                className="border border-gray-200 rounded-2xl px-8 shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
              >
                <AccordionTrigger className="text-xl font-bold hover:no-underline py-8 text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-8 text-lg leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-16 px-6 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              yudoku
            </h3>
            <p className="text-gray-600">
              The YouTube Course Experience Platform
            </p>
          </div>
          <p className="text-gray-500">
            © {new Date().getFullYear()} yudoku. jerkeyray corp.
          </p>
        </div>
      </footer>
    </div>
  );
}
