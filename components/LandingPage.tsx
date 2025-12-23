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
  ArrowRight,
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
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
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
          <div className="h-3 w-3 rounded-full bg-neutral-700/50" />
          <div className="h-3 w-3 rounded-full bg-neutral-700/50" />
          <div className="h-3 w-3 rounded-full bg-neutral-700/50" />
        </div>
        <div className="mx-auto flex w-full max-w-sm items-center gap-2 rounded-md bg-[#151921] px-3 py-1 text-xs text-neutral-500 font-mono">
          <span className="text-white">yudoku.app</span>
          /dashboard/course/react-mastery
        </div>
      </div>

      {/* App Interface */}
      <div className="flex h-[400px] sm:h-[500px]">
        {/* Sidebar */}
        <div className="hidden w-64 flex-none border-r border-white/5 bg-[#0D1016] p-4 sm:block">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-white/10 text-white flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-white">
              React Mastery
            </span>
          </div>
          <div className="space-y-1">
            {["Fundamentals", "Advanced Hooks", "State Management"].map(
              (title, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                    i === 1
                      ? "bg-white/5 text-white"
                      : "text-neutral-500 hover:bg-white/5 hover:text-neutral-300"
                  }`}
                >
                  {i === 0 ? (
                    <CheckCircle className="h-4 w-4 text-neutral-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-neutral-700 opacity-40" />
                  )}
                  <span className="truncate">
                    Chapter {i + 1}: {title}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#0B0D12]">
          {/* Video Player Placeholder */}
          <div className="aspect-video w-full bg-black relative flex items-center justify-center group">
            {/* Removed gradient overlay for cleaner look */}
            <div className="h-16 w-16 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-xl group-hover:scale-105 transition-transform">
              <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
            </div>

            {/* Player Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-4 text-white/70">
              <Play className="h-4 w-4" fill="currentColor" />
              <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-white" />
              </div>
              <span className="text-xs font-mono text-neutral-400">
                14:20 / 45:00
              </span>
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
    <div className="bg-[#0A0A0A] text-white font-sans selection:bg-neutral-700/30">
      {/* Background Noise Texture (Matched to Sign In) */}
      <div className="fixed inset-0 z-0 opacity-[0.015] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-start pt-32 pb-10 px-6 overflow-hidden md:pt-48">
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <FadeIn>
              <h1 className="text-5xl md:text-7xl font-medium tracking-tighter text-white mb-8 leading-[0.95]">
                Escape the algorithm. <br />
                Finish the course.
              </h1>
              <p className="text-xl md:text-2xl text-neutral-400 font-light max-w-xl mx-auto leading-relaxed mb-12">
                YouTube is built to keep you watching.
                <br />
                Yudoku is built to help you finish.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base bg-white text-black hover:bg-neutral-200 rounded-md font-medium transition-colors"
                  asChild
                >
                  <Link href={getStartedLink}>Start learning</Link>
                </Button>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.2} className="relative">
            <div className="text-center mb-6">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest">
                What learning looks like without the algorithm
              </p>
            </div>
            <ProductMockup />
          </FadeIn>
        </div>
      </section>

      {/* Features Section - Reduced to 3 Outcome Points */}
      <section className="py-32 px-6 border-t border-white/5 bg-[#0A0A0A] relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-16 text-center md:text-left">
            {[
              {
                icon: Layout,
                title: "Distraction-free by default",
                desc: "No recommendations. No comments. No noise.",
              },
              {
                icon: Trophy,
                title: "Progress is explicit",
                desc: "You always know what's done and what isn't.",
              },
              {
                icon: BookOpen,
                title: "Structure from chaos",
                desc: "Any playlist becomes a clear, finite course.",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-medium text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-neutral-400 leading-relaxed font-light text-lg">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal Flow Section */}
      <section
        id="how-it-works"
        className="py-32 px-6 border-t border-white/5 relative bg-[#0A0A0A]"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-xl md:text-2xl text-neutral-400 font-light">
            <span className="text-white font-medium">Add a playlist</span>
            <ArrowRight className="h-5 w-5 text-neutral-600 rotate-90 md:rotate-0" />
            <span className="text-white font-medium">Get a course</span>
            <ArrowRight className="h-5 w-5 text-neutral-600 rotate-90 md:rotate-0" />
            <span className="text-white font-medium">Finish it</span>
          </div>
        </div>
      </section>

      {/* FAQ - Cut Down */}
      <section className="py-32 px-6 border-t border-white/5 bg-[#0A0A0A]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-medium tracking-tight text-white mb-12 text-center">
            Common Questions
          </h2>
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-0 border-t border-white/5"
          >
            {[
              {
                q: "Why not just use YouTube?",
                a: "YouTube is designed for retention, not completion. Yudoku removes the sidebar, comments, and algorithm to keep you focused.",
              },
              {
                q: "Does this work with any playlist?",
                a: "It works with any public YouTube playlist.",
              },
              {
                q: "Is this free?",
                a: "Yes. Yudoku is free to use.",
              },
            ].map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-white/5"
              >
                <AccordionTrigger className="text-neutral-200 hover:text-white hover:no-underline py-5 text-base font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-400 pb-5 font-light leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center bg-[#0A0A0A]">
        <p className="text-neutral-600 text-sm">
          © {new Date().getFullYear()} yudoku.
        </p>
      </footer>
    </div>
  );
}
