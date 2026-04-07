import { loadEnv } from "./env";

export const appConfig = {
  env: loadEnv(),
  docs: {
    title: "Aura Messaging API",
    version: "1.0.0",
    swaggerPath: "/api/docs"
  },
  rateLimits: {
    auth: { windowMs: 60_000, limit: 10 },
    otp: { windowMs: 60_000, limit: 5 },
    ai: { windowMs: 60_000, limit: 20 }
  },
  uploads: {
    maxImageBytes: 10 * 1024 * 1024,
    maxVideoBytes: 100 * 1024 * 1024,
    maxDocumentBytes: 25 * 1024 * 1024,
    maxVoiceBytes: 20 * 1024 * 1024
  }
};

