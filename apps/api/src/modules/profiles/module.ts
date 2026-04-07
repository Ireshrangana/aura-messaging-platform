import { defineModule } from "../../lib/contracts";

export const profilesModule = defineModule({
  domain: "profiles",
  basePath: "/api/profile",
  description: "Profile-specific APIs for avatar upload, bio, status, and privacy-facing public profile data.",
  controllers: ["ProfilesController"],
  services: ["ProfilesService", "AvatarService"],
  repositories: ["ProfilesRepository"],
  guards: ["JwtAuthGuard"],
  routes: [
    { method: "GET", path: "/api/profile/me", summary: "Get current profile", auth: "user", tags: ["Profiles"] },
    { method: "PATCH", path: "/api/profile/me", summary: "Update current profile", auth: "user", tags: ["Profiles"] },
    { method: "POST", path: "/api/profile/avatar", summary: "Upload avatar", auth: "user", tags: ["Profiles"] }
  ]
});

