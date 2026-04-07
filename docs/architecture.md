# Product Architecture

## Frontend

- App shell with adaptive three-panel layout for desktop and single-panel mobile navigation
- Design system primitives stored in reusable UI components
- Feature slices:
  - authentication
  - inbox and chat list
  - conversation
  - group management
  - stories
  - calling
  - settings and linked devices
  - admin and moderation

## Backend

- API gateway with auth/session middleware
- Realtime event service for messages, presence, typing, reactions, and read receipts
- AI orchestration service with provider abstraction, safety controls, and audit logging
- Security service for anomaly detection, rate limiting, device trust, and report workflows

## Performance

- Cursor pagination for messages and chats
- Attachment thumbnails and signed URLs
- Read-optimized composite indexes for chat timelines
- Semantic search pipeline using embeddings with permission-filtered retrieval

