import { printRoutes } from "../../lib/contracts";

export const authRoutes = printRoutes("auth", [
  { method: "POST", path: "/auth/signup", summary: "Create account with email or phone", auth: "public" },
  { method: "POST", path: "/auth/login", summary: "Login with email/password", auth: "public" },
  { method: "POST", path: "/auth/otp/request", summary: "Request OTP", auth: "public" },
  { method: "POST", path: "/auth/otp/verify", summary: "Verify OTP", auth: "public" },
  { method: "POST", path: "/auth/2fa/verify", summary: "Verify second factor", auth: "public" },
  { method: "POST", path: "/auth/logout", summary: "Invalidate current session", auth: "user" },
  { method: "GET", path: "/auth/sessions", summary: "List active sessions and trusted devices", auth: "user" }
]);

