import LandingPage from "@/components/LandingPage";
import { Navbar } from "@/components/Navbar";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  return (
    <div className="light">
      <Navbar session={session} />
      <LandingPage session={session} />
    </div>
  );
}
