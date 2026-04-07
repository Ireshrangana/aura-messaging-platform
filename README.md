# Aura Messaging Platform

Aura Messaging Platform is a modern messaging product foundation that combines a premium Next.js client, a modular Node backend architecture, admin operations tooling, AI-assisted messaging workflows, and privacy-first product design.

The repository is structured for startup MVP velocity while keeping a clean path toward enterprise-scale features such as moderation, auditability, realtime collaboration, and secure communications.

## Highlights

- Premium messaging UI inspired by WhatsApp, Telegram, and iMessage
- Mobile-first responsive product shell with desktop workspace patterns
- Demo-ready realtime chat flows, AI actions, and admin operations screens
- Production-oriented backend architecture for auth, messaging, moderation, analytics, and security
- Prisma schema for scalable messaging, devices, reports, AI logs, and audit trails
- WebRTC-based live media demo flow between local signed-in users

## Repository Structure

```text
.
├── apps/
│   ├── api/        # Backend architecture, admin preview APIs, OpenAPI docs
│   └── web/        # Next.js frontend application
├── docs/           # Architecture, AI, security, realtime, and admin design docs
├── packages/
│   ├── db/         # Prisma schema and database package
│   └── shared/     # Shared types, navigation, and design contracts
├── .env.example    # Example configuration only
└── docker-compose.yml
```

## Product Scope

Aura is designed around these product pillars:

- Realtime direct and group messaging
- AI-assisted conversation workflows
- Privacy and trust-first messaging UX
- Admin governance and moderation controls
- Scalable backend boundaries for future multi-device and cross-platform growth

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js architecture with Nest-style modular boundaries
- Database: PostgreSQL with Prisma
- Cache / Presence / Queue: Redis
- Realtime: WebSockets and WebRTC-ready signaling patterns
- AI Layer: OpenAI-compatible provider abstraction
- Storage: Signed URL media delivery model

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL
- Redis

### Install

```bash
pnpm install
```

### Configure Environment

Copy `.env.example` into your own local environment files as needed.

Do not commit real credentials, tokens, API keys, database URLs, or private certificates.

### Run the Web App

```bash
pnpm --filter @aura/web dev
```

### Run the Backend

```bash
pnpm --filter @aura/api dev
```

### Run the Full Workspace

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

## Security Notes

- This repository intentionally includes only `.env.example`
- No real secrets should be committed
- Local `.env`, `.env.local`, and environment-specific local files are gitignored
- Sensitive files such as private keys and temporary local artifacts should remain outside version control

If you plan to publish or fork this repository publicly, review your local working directory before pushing and verify that no real secrets have been added.

## Current Demo Capabilities

- Messenger dashboard with multi-user demo login
- Admin login and super-admin review flows
- Password approval workflow
- Chat details drawer
- AI and security action panel
- Live demo voice/video calling between local signed-in tabs

## Documentation

See the `docs/` directory for deeper implementation guidance:

- architecture and folder design
- security model
- admin RBAC
- realtime behavior
- AI integration design
- backend testing direction

## Publishing Guidance

Recommended steps before publishing publicly:

1. Review `.env.example` and keep it example-only
2. Confirm no local `.env` files or private keys exist in the repo root
3. Review any generated lockfile strategy you want to keep
4. Add a license if you want public reuse rights to be explicit
5. Push to a new public repository only after the above review

## Status

This repository is a polished product foundation and demo platform, not yet a finished production deployment. It is designed to accelerate product design, engineering, and stakeholder demos while preserving clean architectural boundaries for future hardening.
