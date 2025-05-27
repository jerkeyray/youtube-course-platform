import { Navbar } from "@/components/Navbar";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      <Navbar />
      <main className="h-full pt-16">{children}</main>
    </div>
  );
}
