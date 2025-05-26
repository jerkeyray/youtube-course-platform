import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, PlayCircle, Star } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-white text-black">
      {/* Hero Section */}
      <section className="min-h-[90vh] px-8 py-24 text-center flex flex-col justify-center items-center">
        <h1 className="text-6xl md:text-8xl font-extrabold leading-tight max-w-5xl mb-8">
          Learn Smarter with Yudoku
        </h1>
        <p className="text-xl md:text-3xl text-gray-700 max-w-3xl mb-10">
          Transform YouTube playlists into structured, distraction-free learning experiences.
        </p>
        <Button size="lg" className="text-xl px-8 py-5" asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24 px-8 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-16">Features</h2>
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <Card className="p-8 shadow-xl">
            <CardContent className="flex flex-col items-center">
              <PlayCircle className="h-14 w-14 text-black mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Distraction-Free Viewing</h3>
              <p className="text-gray-600 text-lg">Watch YouTube playlists without distractions and stay focused on learning.</p>
            </CardContent>
          </Card>
          <Card className="p-8 shadow-xl">
            <CardContent className="flex flex-col items-center">
              <CheckCircle className="h-14 w-14 text-black mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Progress Tracking</h3>
              <p className="text-gray-600 text-lg">Track which videos you've watched and see your completion rate.</p>
            </CardContent>
          </Card>
          <Card className="p-8 shadow-xl">
            <CardContent className="flex flex-col items-center">
              <Star className="h-14 w-14 text-black mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Custom Courses</h3>
              <p className="text-gray-600 text-lg">Turn any YouTube playlist into your own structured course.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-8 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-16">How It Works</h2>
        <ol className="max-w-4xl mx-auto space-y-8 text-left text-xl text-gray-800">
          <li><strong>Step 1:</strong> Sign in using your Google or email account.</li>
          <li><strong>Step 2:</strong> Paste a YouTube playlist link to create a course.</li>
          <li><strong>Step 3:</strong> Watch videos and track your progress.</li>
          <li><strong>Step 4:</strong> Take notes, set goals, and stay on track.</li>
        </ol>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-24 px-8 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-10">Ready to Learn Smarter?</h2>
        <p className="text-xl md:text-3xl mb-10 text-gray-300">
          Start your distraction-free learning journey today.
        </p>
        <Button size="lg" className="text-xl px-8 py-5 bg-white text-black font-bold hover:bg-gray-200" asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-8 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-16">FAQs</h2>
        <div className="max-w-3xl mx-auto text-left">
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="q1">
              <AccordionTrigger className="text-xl">Is Yuco free to use?</AccordionTrigger>
              <AccordionContent className="text-gray-700 text-lg">
                Yes, Yudoku is free to use while in beta. We may introduce premium features in the future.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger className="text-xl">Do I need a YouTube account?</AccordionTrigger>
              <AccordionContent className="text-gray-700 text-lg">
                No, but we recommend logging in with your Google account to enhance your experience.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger className="text-xl">Can I track my learning goals?</AccordionTrigger>
              <AccordionContent className="text-gray-700 text-lg">
                Absolutely. Yuco helps you set daily watch goals and track your progress.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-700 py-10 px-8 text-center">
        <p className="text-lg">© {new Date().getFullYear()} Yudoku. All rights reserved.</p>
      </footer>
    </div>
  );
}
