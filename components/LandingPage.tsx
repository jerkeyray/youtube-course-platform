"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  Layout,
  Trophy,
  BookOpen,
  Play,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

// Reusable FadeIn component for smooth entrances
function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Product Mockup Component
function ProductMockup() {
  return (
    <div className="relative mx-auto max-w-[1000px] rounded-xl border border-white/10 bg-[#0F1117] shadow-2xl shadow-black/50 overflow-hidden">
      {/* Fake Browser Chrome */}
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#0B0D12] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/20" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
          <div className="h-3 w-3 rounded-full bg-green-500/20" />
        </div>
        <div className="mx-auto flex w-full max-w-sm items-center gap-2 rounded-md bg-[#151921] px-3 py-1 text-xs text-slate-500 font-mono">
          <span className="text-blue-500">yudoku.app</span>
          /dashboard/course/react-mastery
        </div>
      </div>

      {/* App Interface */}
      <div className="flex h-[400px] sm:h-[500px]">
        {/* Sidebar */}
        <div className="hidden w-64 flex-none border-r border-white/5 bg-[#0D1016] p-4 sm:block">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-blue-600/20 text-blue-500 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-200">
              React Mastery
            </span>
          </div>
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                  i === 2
                    ? "bg-blue-600/10 text-blue-400"
                    : "text-slate-400 hover:bg-white/5"
                }`}
              >
                {i === 1 ? (
                  <CheckCircle className="h-4 w-4 text-green-500/50" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-current opacity-40" />
                )}
                <span className="truncate">Chapter {i}: Fundamentals</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#0B0D12]">
          {/* Video Player Placeholder */}
          <div className="aspect-video w-full bg-black relative flex items-center justify-center group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
            <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
              <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
            </div>

            {/* Player Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-4 text-white/70">
              <Play className="h-4 w-4" fill="currentColor" />
              <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-blue-500" />
              </div>
              <span className="text-xs font-mono">14:20 / 45:00</span>
              <Maximize2 className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { status } = useSession();
  const getStartedLink = status === "authenticated" ? "/dashboard" : "/sign-in";

  return (
    <div className="bg-[#020817] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden md:pt-40">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <FadeIn>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                Turn YouTube Playlists into <br />
                <span className="text-blue-500">Completed Courses</span>.
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
                Stop abandoning tutorials. Yudoku gives you the structure,
                tracking, and distraction-free focus you need to actually learn
                from YouTube.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] transition-all hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.6)]"
                  asChild
                >
                  <Link href={getStartedLink}>Start Learning for Free</Link>
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-12 px-8 text-slate-200 bg-white/10 hover:bg-white/20 border border-white/5 rounded-lg"
                  asChild
                >
                  <Link href="#how-it-works">How it works</Link>
                </Button>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.2} className="relative">
            {/* Glow effect behind mock */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50 -z-10" />
            <ProductMockup />
          </FadeIn>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-32 px-6 border-t border-white/5 bg-[#0B0D12]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Layout,
                problem: "YouTube is built for retention.",
                solution: "Yudoku is built for completion.",
                desc: "We strip away the sidebar, comments, and recommendations so you can focus on the content, not the algorithm.",
              },
              {
                icon: Trophy,
                problem: "Tutorial hell is real.",
                solution: "Track your actual progress.",
                desc: "Visualize your journey with chapter completion rates, streaks, and time-spent metrics that keep you motivated.",
              },
              {
                icon: BookOpen,
                problem: "Playlists are messy.",
                solution: "Courses are structured.",
                desc: "We automatically organize chaotic playlists into clean, linear course chapters with progress saving.",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <item.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    <span className="text-slate-500 line-through decoration-slate-600 mr-2 opacity-60 text-base font-normal">
                      {item.problem}
                    </span>
                    <br />
                    {item.solution}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works (Simplified) */}
      <section
        id="how-it-works"
        className="py-32 px-6 border-t border-white/5 relative"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              From Playlist to Course in Seconds
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {[
              {
                step: 1,
                title: "Paste URL",
                desc: "Copy any YouTube playlist link",
              },
              {
                step: 2,
                title: "Structure",
                desc: "We organize it into chapters",
              },
              {
                step: 3,
                title: "Learn",
                desc: "Track progress distraction-free",
              },
            ].map((item, i) => (
              <FadeIn
                key={i}
                delay={i * 0.15}
                className="relative bg-[#020817] p-6 rounded-2xl border border-white/5 text-center group hover:border-blue-500/30 transition-colors"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 border-t border-white/5 bg-[#0B0D12]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Stop watching. Start learning.
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join thousands of developers and learners who have switched from
            passive watching to active course completion.
          </p>
          <Button
            size="lg"
            className="h-14 px-10 text-lg bg-white text-black hover:bg-slate-200 rounded-full font-semibold"
            asChild
          >
            <Link href={getStartedLink}>Get Started for Free</Link>
          </Button>
          <p className="mt-6 text-sm text-slate-500">
            No credit card required. Open source content only.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">
            Common Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              {
                q: "Is it free?",
                a: "Yes. Yudoku is currently in open beta and completely free to use.",
              },
              {
                q: "Does it work with any playlist?",
                a: "It works with any public YouTube playlist. Private or unlisted playlists are not supported yet.",
              },
              {
                q: "Do I need a YouTube Premium account?",
                a: "No. Yudoku embeds YouTube videos directly, so your standard YouTube account status applies.",
              },
            ].map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-white/10"
              >
                <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline py-6">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 pb-6">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <p className="text-slate-600 text-sm">
          © {new Date().getFullYear()} yudoku. Built for learners.
        </p>
      </footer>
    </div>
  );
}
