import { defineModule } from "../../lib/contracts";

export const authModule = defineModule({
  domain: "auth",
  basePath: "/api/auth",
  description: "User authentication, OTP, password reset, sessions, and suspicious-login handling.",
  controllers: ["AuthController", "OtpController", "SessionController"],
  services: ["AuthService", "OtpService", "SessionService", "PasswordResetService", "SuspiciousLoginService"],
  repositories: ["AuthRepository", "OtpRepository", "SessionRepository"],
  guards: ["JwtAuthGuard", "RefreshTokenGuard"],
  jobs: ["SendOtpJob", "SendPasswordResetEmailJob", "NotifyLoginAlertJob"],
  dtos: [
    { name: "SignupDto", fields: ["email", "password", "phone", "displayName"] },
    { name: "LoginDto", fields: ["email", "password", "deviceFingerprint"] },
    { name: "OtpRequestDto", fields: ["phone", "purpose"] },
    { name: "RefreshTokenDto", fields: ["refreshToken"] }
  ],
  routes: [
    { method: "POST", path: "/api/auth/signup", summary: "Create account with email/password and optional phone", auth: "public", tags: ["Auth"] },
    { method: "POST", path: "/api/auth/login", summary: "Login with email/password", auth: "public", tags: ["Auth"] },
    { method: "POST", path: "/api/auth/otp/request", summary: "Request phone OTP", auth: "public", tags: ["Auth"] },
    { method: "POST", path: "/api/auth/otp/verify", summary: "Verify OTP and issue session tokens", auth: "public", tags: ["Auth"] },
    { method: "POST", path: "/api/auth/refresh", summary: "Rotate refresh token", auth: "public", tags: ["Auth"] },
    { method: "POST", path: "/api/auth/logout", summary: "Logout current device", auth: "user", tags: ["Auth"] },
    { method: "POST", path: "/api/auth/logout-all", summary: "Logout all devices", auth: "user", tags: ["Auth"] },
    { method: "POST", path: "/api/auth/forgot-password", summary: "Trigger password reset flow", auth: "public", tags: ["Auth"] },
    { method: "POST", path: "/api/auth/reset-password", summary: "Reset password using secure token", auth: "public", tags: ["Auth"] },
    { method: "GET", path: "/api/auth/sessions", summary: "List active sessions and devices", auth: "user", tags: ["Auth"] }
  ]
});

