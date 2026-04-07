import { defineModule } from "../../lib/contracts";

export const chatsModule = defineModule({
  domain: "chats",
  basePath: "/api/chats",
  description: "Direct chat lifecycle, recent chats, pin/archive/mute, and unread state.",
  controllers: ["ChatsController", "ChatSearchController"],
  services: ["ChatsService", "ChatListService", "ChatSearchService", "SharedAssetsService"],
  repositories: ["ChatsRepository", "ChatMembersRepository", "MessageRepository"],
  guards: ["JwtAuthGuard", "ChatMemberGuard"],
  websocketEvents: ["chat.updated", "presence.changed"],
  routes: [
    { method: "POST", path: "/api/chats/direct", summary: "Create or reuse a direct chat", auth: "user", tags: ["Chats"] },
    { method: "GET", path: "/api/chats", summary: "Fetch chat list", auth: "user", tags: ["Chats"] },
    { method: "GET", path: "/api/chats/recent", summary: "Fetch recent chats", auth: "user", tags: ["Chats"] },
    { method: "PATCH", path: "/api/chats/:id/pin", summary: "Pin or unpin a chat", auth: "user", tags: ["Chats"] },
    { method: "PATCH", path: "/api/chats/:id/archive", summary: "Archive or unarchive a chat", auth: "user", tags: ["Chats"] },
    { method: "PATCH", path: "/api/chats/:id/mute", summary: "Mute a chat", auth: "user", tags: ["Chats"] },
    { method: "PATCH", path: "/api/chats/:id/unread", summary: "Mark chat unread", auth: "user", tags: ["Chats"] },
    { method: "GET", path: "/api/chats/search", summary: "Search chats", auth: "user", tags: ["Chats"] },
    { method: "GET", path: "/api/chats/:id/shared", summary: "List shared media/files/links", auth: "user", tags: ["Chats"] }
  ]
});

