import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      <div className="bg-black h-full">
        <main className="container h-full pt-6 pb-6 px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 h-full">
            {/* Course Player Skeleton */}
            <div className="lg:col-span-8 h-full flex flex-col gap-4">
              <div className="aspect-video w-full bg-zinc-900 rounded-xl overflow-hidden">
                <Skeleton className="w-full h-full bg-zinc-800" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 bg-zinc-900" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32 bg-zinc-900" />
                  <Skeleton className="h-4 w-24 bg-zinc-900" />
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-4 h-full">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl h-full flex flex-col">
                <div className="p-4 border-b border-zinc-800 space-y-4">
                  <Skeleton className="h-6 w-1/2 bg-zinc-800" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20 bg-zinc-800" />
                      <Skeleton className="h-3 w-10 bg-zinc-800" />
                    </div>
                    <Skeleton className="h-1.5 w-full bg-zinc-800 rounded-full" />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden p-4 space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-16 w-28 rounded-md bg-zinc-800 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full bg-zinc-800" />
                        <Skeleton className="h-3 w-1/2 bg-zinc-800" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
