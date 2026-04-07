import { defineModule } from "../../lib/contracts";

export const usersModule = defineModule({
  domain: "users",
  basePath: "/api/users",
  description: "User directory, profile, privacy settings, blocking, and device-aware identity features.",
  controllers: ["UsersController", "ProfilesController", "PrivacyController"],
  services: ["UsersService", "ProfilesService", "PrivacyService", "BlockListService"],
  repositories: ["UsersRepository", "ProfilesRepository", "SettingsRepository"],
  guards: ["JwtAuthGuard"],
  dtos: [
    { name: "UpdateProfileDto", fields: ["displayName", "bio", "statusText", "avatarUrl"] },
    { name: "PrivacySettingsDto", fields: ["lastSeenVisible", "readReceipts", "profileVisibility", "storyVisibility"] }
  ],
  routes: [
    { method: "GET", path: "/api/users/me", summary: "Fetch current user profile", auth: "user", tags: ["Users"] },
    { method: "PATCH", path: "/api/users/me", summary: "Update current user profile", auth: "user", tags: ["Users"] },
    { method: "PATCH", path: "/api/users/me/privacy", summary: "Update privacy settings", auth: "user", tags: ["Users"] },
    { method: "POST", path: "/api/users/:id/block", summary: "Block a user", auth: "user", tags: ["Users"] },
    { method: "DELETE", path: "/api/users/:id/block", summary: "Unblock a user", auth: "user", tags: ["Users"] },
    { method: "POST", path: "/api/users/:id/report", summary: "Report a user", auth: "user", tags: ["Users"] }
  ]
});

