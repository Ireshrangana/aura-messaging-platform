import { defineModule } from "../../lib/contracts";

export const mediaModule = defineModule({
  domain: "media",
  basePath: "/api/media",
  description: "Secure media uploads, signed URLs, MIME validation, and antivirus processing hooks.",
  controllers: ["MediaController"],
  services: ["MediaService", "SignedUrlService", "VirusScanService"],
  repositories: ["MediaRepository"],
  guards: ["JwtAuthGuard"],
  jobs: ["GenerateImagePreviewJob", "GenerateVideoPreviewJob", "VirusScanJob"],
  routes: [
    { method: "POST", path: "/api/media/upload-url", summary: "Create signed upload URL", auth: "user", tags: ["Media"] },
    { method: "POST", path: "/api/media/complete", summary: "Finalize uploaded media", auth: "user", tags: ["Media"] },
    { method: "GET", path: "/api/media/:id/access-url", summary: "Create signed download URL", auth: "user", tags: ["Media"] }
  ]
});

