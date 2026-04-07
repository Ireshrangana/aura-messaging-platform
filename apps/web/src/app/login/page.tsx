import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";

export default function LoginPage() {
  return (
    <AuthShell
      mode="login"
      title="A premium messaging workspace that starts secure."
      subtitle="Designed for fast communication, intelligent assistance, and clear trust at every step."
      alternateAction={
        <span>
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="font-medium text-aura-500">
            Create one
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}

