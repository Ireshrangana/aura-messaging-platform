import { printRoutes } from "../../lib/contracts";

export const adminRoutes = printRoutes("admin", [
  { method: "GET", path: "/admin/reports", summary: "Moderation queue for flagged content", auth: "admin" },
  { method: "GET", path: "/admin/security-alerts", summary: "Suspicious login attempts and anomalies", auth: "admin" },
  { method: "GET", path: "/admin/users", summary: "User management and trust posture", auth: "admin" },
  { method: "GET", path: "/admin/ai-usage", summary: "AI usage analytics and moderation signals", auth: "admin" }
]);

