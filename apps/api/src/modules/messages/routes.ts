import { printRoutes } from "../../lib/contracts";

export const messageRoutes = printRoutes("messages", [
  { method: "GET", path: "/chats/:chatId/messages", summary: "Cursor-paginated message history", auth: "user" },
  { method: "POST", path: "/chats/:chatId/messages", summary: "Send text or attachment message", auth: "user" },
  { method: "PATCH", path: "/messages/:messageId", summary: "Edit message", auth: "user" },
  { method: "DELETE", path: "/messages/:messageId", summary: "Delete message", auth: "user" },
  { method: "POST", path: "/messages/:messageId/reactions", summary: "Add reaction", auth: "user" },
  { method: "POST", path: "/messages/:messageId/read", summary: "Mark message as read", auth: "user" }
]);

