import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none",
          },
        }}
      />
    </main>
  );
}
