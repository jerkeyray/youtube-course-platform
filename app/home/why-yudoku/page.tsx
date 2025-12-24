import Link from "next/link";

export default function WhyYudokuPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-200">
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
          Why Yudoku
        </h1>

        <div className="mt-10 text-[15px] leading-7">
          <section className="space-y-4">
            <p>
              Yudoku exists because most learning tools are designed to keep you
              watching, not finishing.
            </p>
            <p>This one is built to help you finish.</p>

            <div className="h-px bg-white/10 my-8" />

            <p>Most platforms optimize for engagement.</p>
            <p>More recommendations. More choices. More noise.</p>
            <p>Yudoku optimizes for completion.</p>

            <ul className="list-disc pl-5 space-y-1">
              <li>No algorithmic feed</li>
              <li>No endless recommendations</li>
              <li>One active commitment at a time</li>
              <li>Clear progress, visible finish lines</li>
            </ul>

            <p>
              The goal is not to discover more content.
              <br />
              The goal is to actually get through the content you already chose.
            </p>

            <div className="h-px bg-white/10 my-8" />

            <p>Things Yudoku intentionally does not do:</p>

            <ul className="list-disc pl-5 space-y-1">
              <li>It doesn’t try to guess what you should watch next</li>
              <li>It doesn’t optimize for watch time</li>
              <li>It doesn’t push unrelated content</li>
              <li>It doesn’t pretend “starting” equals learning</li>
            </ul>

            <p>If a feature makes finishing harder, it doesn’t belong here.</p>

            <div className="h-px bg-white/10 my-10" />

            <p>Yudoku is built and maintained by a single developer.</p>
            <p>
              It’s shaped by repeated frustration with half-finished playlists,
              fake productivity, and tools that confuse motion with progress.
            </p>

            <div className="h-px bg-white/10 my-10" />

            <p>You can find my other work here:</p>
            <p>
              <Link
                href="https://jerkeyray.com"
                target="_blank"
                className="underline underline-offset-4 hover:text-white"
              >
                jerkeyray.com — Aditya Srivastava
              </Link>
            </p>

            <div className="h-px bg-white/10 my-12" />

            <p>
              If Yudoku helped you finish something you would’ve otherwise
              dropped, you can support its continued development here.
            </p>
            <p>
              <Link
                href="https://buymeacoffee.com/jerkeyray"
                target="_blank"
                className="underline underline-offset-4 hover:text-white"
              >
                Buy me a coffee
              </Link>
            </p>

            <p className="pt-6 text-xs text-neutral-500">
              Built to reduce noise. Not add to it.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
