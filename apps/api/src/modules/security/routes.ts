import { printRoutes } from "../../lib/contracts";

export const securityRoutes = printRoutes("security", [
  { method: "GET", path: "/security/devices", summary: "List linked devices and trust state", auth: "user" },
  { method: "DELETE", path: "/security/devices/:deviceId", summary: "Revoke device", auth: "user" },
  { method: "PATCH", path: "/security/privacy", summary: "Update privacy controls", auth: "user" },
  { method: "POST", path: "/security/report", summary: "Report spam, phishing, or abuse", auth: "user" },
  { method: "GET", path: "/security/audit-logs", summary: "List user security events", auth: "user" }
]);

