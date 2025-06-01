import { redirect } from "next/navigation";

export default function AuthPage() {
  redirect("/sign-in");
}
