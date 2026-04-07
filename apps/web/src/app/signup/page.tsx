import Link from "next/link";

import { SignupForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell
      mode="signup"
      title="Build your secure messaging identity in a few calm steps."
      subtitle="Phone verification, trusted devices, AI preferences, and privacy settings are all part of onboarding."
      alternateAction={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-aura-500">
            Log in
          </Link>
        </span>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
