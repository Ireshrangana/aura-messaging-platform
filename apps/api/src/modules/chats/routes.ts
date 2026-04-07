import { printRoutes } from "../../lib/contracts";

export const chatRoutes = printRoutes("chats", [
  { method: "GET", path: "/chats", summary: "List direct, group, archived, and pinned chats", auth: "user" },
  { method: "POST", path: "/chats", summary: "Create direct or group chat", auth: "user" },
  { method: "GET", path: "/chats/:chatId", summary: "Fetch chat details and member permissions", auth: "user" },
  { method: "PATCH", path: "/chats/:chatId", summary: "Update chat metadata and group settings", auth: "user" },
  { method: "POST", path: "/chats/:chatId/members", summary: "Add members or assign admins", auth: "user" },
  { method: "PATCH", path: "/chats/:chatId/privacy", summary: "Update disappearing messages and chat lock", auth: "user" }
]);

