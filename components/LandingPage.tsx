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
  Copy,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const { status } = useSession();
  const getStartedLink = status === "authenticated" ? "/dashboard" : "/sign-in";
  const buttonText =
    status === "authenticated" ? "Go to Dashboard" : "Get Started";

  return (
    <div className="bg-[#0D1117] text-slate-200">
      {/* Hero Section */}
      <section className="h-screen pt-16 px-6 text-center flex flex-col justify-center items-center relative overflow-hidden">
        {/* Background Aurora */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold leading-[1.05] tracking-tight bg-gradient-to-br from-white via-slate-300 to-slate-400 bg-clip-text text-transparent">
            The YouTube Course
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              Experience Platform
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Transform any YouTube playlist into a structured, focused learning
            experience.
            <span className="font-semibold text-blue-400"> yudoku</span> removes
            distractions and keeps you focused on what matters.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-10 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg group transition-all duration-300 shadow-lg shadow-blue-900/50 hover:shadow-xl hover:shadow-blue-800/50 transform hover:scale-105"
              asChild
            >
              <Link href={getStartedLink} className="flex items-center gap-2">
                {buttonText}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-32 px-6 sm:px-8 lg:px-12 relative bg-[#10141B]"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 px-4 sm:px-0">
            <div className="inline-flex items-center px-4 py-2 bg-blue-950/50 text-blue-400 rounded-full text-sm font-medium mb-6 border border-blue-900">
              <Star className="w-4 h-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight bg-gradient-to-b from-slate-100 to-slate-400 bg-clip-text text-transparent leading-[1.2] py-2">
              Everything you need to learn effectively
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Simple yet powerful tools designed to transform your learning
              experience and help you achieve your goals faster.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: PlayCircle,
                title: "Distraction-Free Player",
                description:
                  "Watch videos in a clean, focused environment without YouTube's distracting sidebar, comments, or recommendations.",
              },
              {
                icon: Target,
                title: "Smart Progress Tracking",
                description:
                  "Visualize your learning journey with beautiful progress indicators, completion rates, and learning streaks.",
              },
              {
                icon: BookOpen,
                title: "Structured Courses",
                description:
                  "Transform any playlist into an organized learning path with clear objectives and milestone tracking.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-slate-900/50 border border-slate-800 hover:border-blue-700/80 hover:bg-slate-900 transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <CardContent className="p-10 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-950">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 bg-[#0D1117] text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-50">
          <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-b from-slate-100 to-slate-400 bg-clip-text text-transparent">
              Get started in minutes
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              From YouTube playlist to structured course in just a few simple
              steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Sign up instantly",
                  description:
                    "Create your account with Google or email in under 30 seconds.",
                },
                {
                  step: "02",
                  title: "Add any playlist",
                  description:
                    "Paste any YouTube playlist URL and we'll structure it into a course.",
                },
                {
                  step: "03",
                  title: "Learn distraction-free",
                  description:
                    "Watch videos in our clean interface designed for deep learning.",
                },
                {
                  step: "04",
                  title: "Track your progress",
                  description:
                    "Monitor your learning journey and celebrate your achievements.",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-6 group">
                  <div className="flex-shrink-0 w-14 h-14 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center font-bold text-2xl text-blue-500 shadow-md group-hover:border-blue-600 transition-colors duration-300">
                    {item.step}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-2xl font-bold mb-2 text-slate-100">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-lg leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative p-8 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg">
                <p className="text-slate-500 font-mono text-sm flex items-center">
                  <span className="text-blue-500 mr-2">&gt;</span> Add Course
                </p>
                <div className="flex items-center gap-2 p-2 mt-2 bg-slate-800/80 rounded">
                  <span className="text-slate-400 font-mono">
                    youtube.com/playlist...
                  </span>
                  <Copy className="w-4 h-4 text-slate-500 ml-auto cursor-pointer hover:text-white" />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="h-4 bg-blue-500/20 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-700/50 rounded-full"></div>
                <div className="h-4 bg-slate-700/50 rounded-full w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-blue-950/30 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <div className="w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[180px] animate-pulse"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
            Ready to transform your learning?
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners who have already discovered the power of
            distraction-free education with yudoku.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-10 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg group transition-all duration-300 shadow-lg shadow-blue-900/50 hover:shadow-xl hover:shadow-blue-800/50 transform hover:scale-105 font-bold"
              asChild
            >
              <Link href={getStartedLink} className="flex items-center gap-2">
                {status === "authenticated"
                  ? "Go to Dashboard"
                  : "Start Your Journey Free"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <p className="text-slate-500 text-sm mt-6">
            No credit card required • Free forever
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 bg-[#10141B]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-b from-slate-100 to-slate-400 bg-clip-text text-transparent">
              Frequently asked questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
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
            ].map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index + 1}`}
                className="border border-slate-800 rounded-xl bg-slate-900/50 transition-colors hover:border-slate-700"
              >
                <AccordionTrigger className="text-xl font-bold text-slate-200 hover:no-underline p-8 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 px-8 pb-8 text-lg leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-16 px-6 bg-[#0D1117]">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent mb-2">
              yudoku
            </h3>
            <p className="text-slate-500">
              The YouTube Course Experience Platform
            </p>
          </div>
          <p className="text-slate-600">
            © {new Date().getFullYear()} yudoku. jerkeyray corp.
          </p>
        </div>
      </footer>
    </div>
  );
}
