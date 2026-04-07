# Backend Architecture

## Runtime stack

- Node.js service boundary prepared for NestJS-style modularization
- PostgreSQL via Prisma schema
- Redis for presence, hot cache, OTP throttling, and queue fanout
- WebSocket or Socket.IO event map documented in `apps/api/src/common/events.ts`
- JWT access and refresh token strategy with admin/session separation

## Modules

- auth
- users and profiles
- chats and groups
- messages and media
- notifications
- ai
- reports and moderation
- settings
- devices and sessions
- security
- admin auth
- admin dashboard
- analytics

## Background work

- notification fanout
- OTP delivery
- login alerts
- media preview generation
- antivirus hooks
- AI summarization and transcription
- moderation classification

