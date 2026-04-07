import { defineModule } from "../../lib/contracts";

export const moderationModule = defineModule({
  domain: "moderation",
  basePath: "/api/admin/moderation",
  description: "Moderation operations for incident workflows, message removal, group freezing, and false-positive handling.",
  controllers: ["ModerationController"],
  services: ["ModerationService", "IncidentEscalationService"],
  repositories: ["ReportsRepository", "ModerationActionsRepository"],
  guards: ["AdminJwtGuard", "RolesGuard"],
  routes: [
    { method: "GET", path: "/api/admin/moderation/queue", summary: "Fetch moderation queue", auth: "admin", tags: ["Admin Moderation"] },
    { method: "POST", path: "/api/admin/messages/:id/remove", summary: "Remove message", auth: "admin", tags: ["Admin Moderation"] },
    { method: "POST", path: "/api/admin/groups/:id/freeze", summary: "Freeze group temporarily", auth: "admin", tags: ["Admin Moderation"] },
    { method: "PATCH", path: "/api/admin/reports/:id/false-positive", summary: "Mark report as false positive", auth: "admin", tags: ["Admin Moderation"] }
  ]
});

