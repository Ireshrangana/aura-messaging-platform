# Security Model

## Identity

- OTP and email/password support
- Argon2 password hashing
- Refresh rotation for long-lived sessions
- Optional TOTP-based 2FA
- Trusted device labels with explicit revoke actions

## Messaging

- Transport security over TLS
- Architecture ready for E2EE key exchange and device identity verification
- Signed URLs for media
- Message edit/delete audit trail
- Suspicious link classification and moderation review

## Privacy defaults

- Minimal public profile exposure
- Granular visibility controls for last seen, read receipts, stories, and avatar visibility
- Notification redaction for locked chats
- Admin access isolated from private content except report-bound evidence

