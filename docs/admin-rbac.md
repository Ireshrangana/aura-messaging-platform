# Admin RBAC

## Roles

- `SUPER_ADMIN`
- `ADMIN`
- `MODERATOR`
- `SUPPORT_AGENT`
- `ANALYST`

## Core permissions

- dashboard overview
- user lifecycle actions
- report assignment and resolution
- message and group moderation
- audit log visibility
- analytics access

## Enforcement

- separate admin JWT secret
- roles guard
- permission matrix on role-permission table
- optional IP allowlist enforcement
- audit logs for every admin mutation

