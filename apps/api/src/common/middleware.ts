export interface MiddlewareDefinition {
  name: string;
  purpose: string;
}

export const commonMiddleware: MiddlewareDefinition[] = [
  { name: "RequestIdMiddleware", purpose: "Attach a correlation id to every request." },
  { name: "HelmetMiddleware", purpose: "Apply secure headers and browser hardening defaults." },
  { name: "RateLimitMiddleware", purpose: "Protect auth, OTP, and AI routes against abuse." },
  { name: "AuditContextMiddleware", purpose: "Capture actor, device, and IP information." },
  { name: "ValidationMiddleware", purpose: "Reject malformed payloads before controller execution." }
];

