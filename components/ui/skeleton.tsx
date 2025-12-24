import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-white/5 animate-pulse-subtle rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
