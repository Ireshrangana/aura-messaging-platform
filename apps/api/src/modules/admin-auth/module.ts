import { defineModule } from "../../lib/contracts";

export const adminAuthModule = defineModule({
  domain: "admin-auth",
  basePath: "/api/admin/auth",
  description: "Separate admin login, admin sessions, RBAC setup, IP restrictions, and 2FA-ready flow.",
  controllers: ["AdminAuthController"],
  services: ["AdminAuthService", "AdminSessionService"],
  repositories: ["AdminUsersRepository", "AdminAuditLogRepository"],
  guards: ["AdminJwtGuard", "RolesGuard", "IpAllowlistGuard"],
  routes: [
    { method: "POST", path: "/api/admin/auth/login", summary: "Admin login", auth: "public", tags: ["Admin Auth"] },
    { method: "POST", path: "/api/admin/auth/logout", summary: "Admin logout", auth: "admin", tags: ["Admin Auth"] },
    { method: "POST", path: "/api/admin/auth/refresh", summary: "Rotate admin refresh token", auth: "public", tags: ["Admin Auth"] }
  ]
});

