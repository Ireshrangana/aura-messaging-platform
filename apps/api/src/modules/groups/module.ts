import { defineModule } from "../../lib/contracts";

export const groupsModule = defineModule({
  domain: "groups",
  basePath: "/api/groups",
  description: "Group chat management, admin roles, invite links, membership changes, and permissions.",
  controllers: ["GroupsController", "GroupInvitesController"],
  services: ["GroupsService", "GroupMembershipService", "GroupInvitesService", "GroupAuditService"],
  repositories: ["GroupsRepository", "GroupInvitesRepository", "ChatMembersRepository"],
  guards: ["JwtAuthGuard", "ChatMemberGuard"],
  websocketEvents: ["chat.updated"],
  routes: [
    { method: "POST", path: "/api/groups", summary: "Create a group", auth: "user", tags: ["Groups"] },
    { method: "PATCH", path: "/api/groups/:id", summary: "Update group name, image, or description", auth: "user", tags: ["Groups"] },
    { method: "POST", path: "/api/groups/:id/members", summary: "Add group members", auth: "user", tags: ["Groups"] },
    { method: "DELETE", path: "/api/groups/:id/members/:userId", summary: "Remove group member", auth: "user", tags: ["Groups"] },
    { method: "POST", path: "/api/groups/:id/admins/:userId", summary: "Promote member to admin", auth: "user", tags: ["Groups"] },
    { method: "DELETE", path: "/api/groups/:id/admins/:userId", summary: "Demote admin", auth: "user", tags: ["Groups"] },
    { method: "POST", path: "/api/groups/:id/invites", summary: "Create invite link", auth: "user", tags: ["Groups"] },
    { method: "POST", path: "/api/groups/invites/:token/join", summary: "Join group by invite link", auth: "user", tags: ["Groups"] },
    { method: "PATCH", path: "/api/groups/:id/announcement-mode", summary: "Enable or disable announcement-only mode", auth: "user", tags: ["Groups"] }
  ]
});

