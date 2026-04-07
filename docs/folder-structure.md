# Folder Structure

## Top level

- `apps/web`: customer-facing messaging product UI
- `apps/api`: backend service boundaries and route map
- `packages/shared`: shared product types and constants
- `packages/db`: Prisma schema and demo seed data
- `docs`: architecture, security, realtime, AI, and implementation notes

## Web app

- `src/app`: route entry points
- `src/components`: screen-level product components
- `src/components/ui`: reusable design-system primitives
- `src/lib`: seed/demo content and client helpers

## API app

- `src/modules/auth`: signup, login, OTP, 2FA, sessions
- `src/modules/chats`: chat creation, group settings, membership
- `src/modules/messages`: timeline, reactions, read state, attachments
- `src/modules/ai`: smart replies, summaries, rewrite, translation, semantic search
- `src/modules/security`: privacy controls, reports, device management, audit logs
- `src/modules/admin`: moderation dashboard and operational analytics

