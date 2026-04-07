import { defineModule } from "../../lib/contracts";

export const settingsModule = defineModule({
  domain: "settings",
  basePath: "/api/settings",
  description: "User settings for theme, AI, notifications, wallpaper, and privacy-related preferences.",
  controllers: ["SettingsController"],
  services: ["SettingsService"],
  repositories: ["SettingsRepository"],
  guards: ["JwtAuthGuard"],
  routes: [
    { method: "GET", path: "/api/settings", summary: "Fetch user settings", auth: "user", tags: ["Settings"] },
    { method: "PATCH", path: "/api/settings", summary: "Update user settings", auth: "user", tags: ["Settings"] }
  ]
});

