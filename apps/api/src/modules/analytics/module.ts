import { defineModule } from "../../lib/contracts";

export const analyticsModule = defineModule({
  domain: "analytics",
  basePath: "/api/admin/analytics",
  description: "Usage, engagement, retention, AI, abuse, storage, and regional analytics endpoints.",
  controllers: ["AnalyticsController"],
  services: ["AnalyticsService", "RetentionService", "GrowthService"],
  repositories: ["AnalyticsRepository"],
  guards: ["AdminJwtGuard", "RolesGuard"],
  routes: [
    { method: "GET", path: "/api/admin/analytics/dau", summary: "Daily active users", auth: "admin", tags: ["Admin Analytics"] },
    { method: "GET", path: "/api/admin/analytics/mau", summary: "Monthly active users", auth: "admin", tags: ["Admin Analytics"] },
    { method: "GET", path: "/api/admin/analytics/messages", summary: "Message volume trends", auth: "admin", tags: ["Admin Analytics"] },
    { method: "GET", path: "/api/admin/analytics/abuse", summary: "Abuse trends", auth: "admin", tags: ["Admin Analytics"] },
    { method: "GET", path: "/api/admin/analytics/ai", summary: "AI usage trends", auth: "admin", tags: ["Admin Analytics"] }
  ]
});

