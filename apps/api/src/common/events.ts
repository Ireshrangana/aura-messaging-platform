export interface SocketEventDefinition {
  event: string;
  channel: string;
  description: string;
}

export const socketEvents: SocketEventDefinition[] = [
  { event: "message.created", channel: "chat:{chatId}:messages", description: "Broadcast a newly created message." },
  { event: "message.updated", channel: "chat:{chatId}:messages", description: "Broadcast a message edit." },
  { event: "message.deleted", channel: "chat:{chatId}:messages", description: "Broadcast delete-for-self or delete-for-everyone changes." },
  { event: "message.read", channel: "chat:{chatId}:reads", description: "Emit read receipt changes." },
  { event: "message.delivered", channel: "chat:{chatId}:reads", description: "Emit delivered status changes." },
  { event: "typing.started", channel: "chat:{chatId}:typing", description: "Notify that a participant started typing." },
  { event: "typing.stopped", channel: "chat:{chatId}:typing", description: "Notify that a participant stopped typing." },
  { event: "presence.changed", channel: "presence:user:{userId}", description: "Online/offline/last-seen updates." },
  { event: "chat.updated", channel: "chat:{chatId}:meta", description: "Group updates, mute, archive, and membership changes." },
  { event: "notification.created", channel: "user:{userId}:notifications", description: "In-app notification fanout." },
  { event: "admin.alert", channel: "admin:live-alerts", description: "Live moderation/security alerts for admins." }
];

