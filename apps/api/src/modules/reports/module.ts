import { defineModule } from "../../lib/contracts";

export const reportsModule = defineModule({
  domain: "reports",
  basePath: "/api/reports",
  description: "End-user abuse reporting for users, messages, chats, media, and suspicious activity.",
  controllers: ["ReportsController"],
  services: ["ReportsService", "EvidenceService"],
  repositories: ["ReportsRepository"],
  guards: ["JwtAuthGuard"],
  jobs: ["NotifyModerationQueueJob"],
  routes: [
    { method: "POST", path: "/api/reports", summary: "Create a report", auth: "user", tags: ["Reports"] },
    { method: "GET", path: "/api/reports/me", summary: "List current user's reports", auth: "user", tags: ["Reports"] }
  ]
});

