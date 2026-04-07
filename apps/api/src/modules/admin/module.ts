import { defineModule } from "../../lib/contracts";

export const adminModule = defineModule({
  domain: "admin",
  basePath: "/api/admin",
  description: "Admin dashboard APIs for overview metrics, user management, moderation, analytics, and audit logs.",
  controllers: ["AdminDashboardController", "AdminUsersController", "AdminReportsController", "AdminModerationController", "AdminAnalyticsController", "AdminSecurityController"],
  services: ["AdminDashboardService", "AdminUsersService", "AdminReportsService", "AdminModerationService", "AdminAnalyticsService", "AdminSecurityService"],
  repositories: ["AdminUsersRepository", "ReportsRepository", "SecurityLogsRepository", "AdminAuditLogRepository"],
  guards: ["AdminJwtGuard", "RolesGuard"],
  websocketEvents: ["admin.alert"],
  routes: [
    { method: "GET", path: "/api/admin/dashboard/overview", summary: "Dashboard overview metrics", auth: "admin", tags: ["Admin"] },
    { method: "GET", path: "/api/admin/users", summary: "List users", auth: "admin", tags: ["Admin Users"] },
    { method: "GET", path: "/api/admin/users/:id", summary: "View user details", auth: "admin", tags: ["Admin Users"] },
    { method: "PATCH", path: "/api/admin/users/:id/suspend", summary: "Suspend user", auth: "admin", tags: ["Admin Users"] },
    { method: "PATCH", path: "/api/admin/users/:id/ban", summary: "Ban user", auth: "admin", tags: ["Admin Users"] },
    { method: "PATCH", path: "/api/admin/users/:id/reactivate", summary: "Reactivate user", auth: "admin", tags: ["Admin Users"] },
    { method: "POST", path: "/api/admin/users/:id/force-logout", summary: "Force logout user", auth: "admin", tags: ["Admin Users"] },
    { method: "GET", path: "/api/admin/reports", summary: "List reports", auth: "admin", tags: ["Admin Reports"] },
    { method: "GET", path: "/api/admin/reports/:id", summary: "View report details", auth: "admin", tags: ["Admin Reports"] },
    { method: "PATCH", path: "/api/admin/reports/:id/assign", summary: "Assign report to moderator", auth: "admin", tags: ["Admin Reports"] },
    { method: "PATCH", path: "/api/admin/reports/:id/resolve", summary: "Resolve report", auth: "admin", tags: ["Admin Reports"] },
    { method: "POST", path: "/api/admin/messages/:id/remove", summary: "Remove message", auth: "admin", tags: ["Admin Moderation"] },
    { method: "POST", path: "/api/admin/groups/:id/freeze", summary: "Freeze group", auth: "admin", tags: ["Admin Moderation"] },
    { method: "GET", path: "/api/admin/analytics/usage", summary: "Usage analytics", auth: "admin", tags: ["Admin Analytics"] },
    { method: "GET", path: "/api/admin/audit-logs", summary: "Admin audit logs", auth: "admin", tags: ["Admin Security"] }
  ]
});

