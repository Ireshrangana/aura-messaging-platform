import { defineModule } from "../../lib/contracts";

export const messagesModule = defineModule({
  domain: "messages",
  basePath: "/api/messages",
  description: "Realtime-safe message send/edit/delete/read/reaction flows with cursor pagination and attachments.",
  controllers: ["MessagesController", "MessageSearchController"],
  services: ["MessagesService", "MessageReceiptsService", "MessageReactionService", "MessageSearchService"],
  repositories: ["MessagesRepository", "MessageReadsRepository", "MessageReactionsRepository"],
  guards: ["JwtAuthGuard", "ChatMemberGuard"],
  websocketEvents: ["message.created", "message.updated", "message.deleted", "message.read", "message.delivered"],
  dtos: [
    { name: "SendMessageDto", fields: ["chatId", "type", "body", "replyToMessageId", "attachmentIds"] },
    { name: "EditMessageDto", fields: ["body"] }
  ],
  routes: [
    { method: "GET", path: "/api/messages/chat/:chatId", summary: "Fetch messages with cursor pagination", auth: "user", tags: ["Messages"] },
    { method: "POST", path: "/api/messages", summary: "Send a message", auth: "user", tags: ["Messages"] },
    { method: "PATCH", path: "/api/messages/:id", summary: "Edit a message", auth: "user", tags: ["Messages"] },
    { method: "DELETE", path: "/api/messages/:id/self", summary: "Delete message for self", auth: "user", tags: ["Messages"] },
    { method: "DELETE", path: "/api/messages/:id/everyone", summary: "Delete message for everyone", auth: "user", tags: ["Messages"] },
    { method: "POST", path: "/api/messages/:id/reactions", summary: "React to a message", auth: "user", tags: ["Messages"] },
    { method: "POST", path: "/api/messages/:id/read", summary: "Mark message read", auth: "user", tags: ["Messages"] },
    { method: "GET", path: "/api/messages/search", summary: "Search messages", auth: "user", tags: ["Messages"] }
  ]
});

