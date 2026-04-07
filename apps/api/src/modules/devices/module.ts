import { defineModule } from "../../lib/contracts";

export const devicesModule = defineModule({
  domain: "devices",
  basePath: "/api/devices",
  description: "Linked devices, sessions, logout, trusted device flow, and login anomaly handling.",
  controllers: ["DevicesController", "SessionsController"],
  services: ["DevicesService", "SessionsService", "SecuritySignalsService"],
  repositories: ["DevicesRepository", "SessionsRepository"],
  guards: ["JwtAuthGuard"],
  routes: [
    { method: "GET", path: "/api/devices", summary: "List linked devices", auth: "user", tags: ["Devices"] },
    { method: "DELETE", path: "/api/devices/:id", summary: "Logout a device", auth: "user", tags: ["Devices"] },
    { method: "POST", path: "/api/devices/:id/trust", summary: "Trust a device", auth: "user", tags: ["Devices"] },
    { method: "GET", path: "/api/sessions", summary: "List sessions", auth: "user", tags: ["Sessions"] }
  ]
});

