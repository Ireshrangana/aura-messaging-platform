import { defineModule } from "../../lib/contracts";

export const aiModule = defineModule({
  domain: "ai",
  basePath: "/api/ai",
  description: "Provider-agnostic AI orchestration for smart replies, summaries, transcription, translation, and moderation.",
  controllers: ["AiController"],
  services: ["AiProviderService", "AiUsageService", "AiRateLimitService", "ModerationClassifierService"],
  repositories: ["AiUsageRepository"],
  guards: ["JwtAuthGuard"],
  jobs: ["ChatSummaryJob", "VoiceTranscriptionJob", "ModerationClassificationJob"],
  routes: [
    { method: "POST", path: "/api/ai/replies", summary: "Generate smart replies", auth: "user", tags: ["AI"] },
    { method: "POST", path: "/api/ai/summaries/chat", summary: "Summarize a chat", auth: "user", tags: ["AI"] },
    { method: "POST", path: "/api/ai/summaries/unread", summary: "Summarize unread messages", auth: "user", tags: ["AI"] },
    { method: "POST", path: "/api/ai/rewrite", summary: "Rewrite a message", auth: "user", tags: ["AI"] },
    { method: "POST", path: "/api/ai/translate", summary: "Translate text", auth: "user", tags: ["AI"] },
    { method: "POST", path: "/api/ai/transcribe", summary: "Transcribe voice notes", auth: "user", tags: ["AI"] },
    { method: "GET", path: "/api/ai/search", summary: "Semantic search", auth: "user", tags: ["AI"] }
  ]
});

