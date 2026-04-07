import { defineModule } from "../../lib/contracts";

export const notificationsModule = defineModule({
  domain: "notifications",
  basePath: "/api/notifications",
  description: "Push and in-app notifications with queue processing, mute logic, and retry handling.",
  controllers: ["NotificationsController"],
  services: ["NotificationsService", "PushNotificationsService", "MentionNotificationsService"],
  repositories: ["NotificationsRepository"],
  guards: ["JwtAuthGuard"],
  jobs: ["PushNotificationJob", "LoginAlertJob", "RetryFailedNotificationJob"],
  routes: [
    { method: "GET", path: "/api/notifications", summary: "List notifications", auth: "user", tags: ["Notifications"] },
    { method: "PATCH", path: "/api/notifications/:id/read", summary: "Mark notification as read", auth: "user", tags: ["Notifications"] },
    { method: "PATCH", path: "/api/notifications/preferences", summary: "Update notification preferences", auth: "user", tags: ["Notifications"] }
  ]
});

