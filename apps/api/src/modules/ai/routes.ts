import { printRoutes } from "../../lib/contracts";

export const aiRoutes = printRoutes("ai", [
  { method: "POST", path: "/ai/replies", summary: "Generate smart reply suggestions", auth: "user" },
  { method: "POST", path: "/ai/summaries", summary: "Summarize chat or unread messages", auth: "user" },
  { method: "POST", path: "/ai/rewrite", summary: "Rewrite text with tone controls", auth: "user" },
  { method: "POST", path: "/ai/translate", summary: "Translate outgoing or incoming text", auth: "user" },
  { method: "POST", path: "/ai/transcribe", summary: "Transcribe and summarize voice note", auth: "user" },
  { method: "GET", path: "/ai/search", summary: "Semantic search over authorized messages and files", auth: "user" }
]);

