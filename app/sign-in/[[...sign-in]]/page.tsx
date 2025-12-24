import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignInForm from "./SignInForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/home");
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex selection:bg-indigo-500/30 font-sans">
      {/* Background Noise Texture */}
      <div className="fixed inset-0 z-0 opacity-[0.015] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>

      {/* Left side - Editorial / Brand */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-16 overflow-hidden bg-[#0A0A0A]">
        {/* Aurora Background - Matched to Landing Page */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />

          {/* Subtle Rings Overlay (Optional, keeping for texture but lowering opacity to blend) */}
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] border border-white/5 rounded-full opacity-10" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] border border-white/5 rounded-full opacity-10" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="group inline-flex items-center gap-2">
            <span className="font-bold tracking-tight text-lg">yudoku</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-6xl font-medium tracking-tighter leading-[0.95] mb-8 text-white">
            Pick something <br />
            <span className="text-white/40">worth finishing.</span>
          </h1>
          <p className="text-xl text-neutral-400 font-light leading-relaxed max-w-md">
            We’ll keep everything else out of the way.
          </p>
        </div>

        {/* Removed Manifesto Text - Keeping it empty for balance or adding simple copyright if needed, but leaving empty as requested */}
        <div className="relative z-10 text-sm font-medium text-neutral-600">
          © {new Date().getFullYear()} yudoku.
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 bg-[#0A0A0A] relative border-l border-white/5">
        {/* Spotlight Effect */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

        <div className="w-full max-w-[360px] relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 flex justify-center">
            <Link href="/" className="font-bold tracking-tight text-xl">
              yudoku
            </Link>
          </div>

          {/* Glass Card for Form */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition duration-700" />
            <div className="relative bg-[#0A0A0A] border border-white/10 p-1 rounded-xl shadow-2xl shadow-black/50">
              <div className="bg-[#0F0F0F] p-6 rounded-lg border border-white/5">
                <SignInForm />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="text-xs text-neutral-600 hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
