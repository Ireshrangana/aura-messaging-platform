import { defineModule } from "../../lib/contracts";

export const securityModule = defineModule({
  domain: "security",
  basePath: "/api/security",
  description: "Security logs, suspicious login signals, audit events, and abuse prevention hooks.",
  controllers: ["SecurityController"],
  services: ["SecurityLogService", "AnomalyDetectionService", "IpRiskService"],
  repositories: ["SecurityLogsRepository"],
  guards: ["JwtAuthGuard"],
  jobs: ["EvaluateSuspiciousLoginJob"],
  routes: [
    { method: "GET", path: "/api/security/logs", summary: "List user security logs", auth: "user", tags: ["Security"] },
    { method: "GET", path: "/api/security/presence", summary: "List online presence snapshot", auth: "user", tags: ["Security"] }
  ]
});

