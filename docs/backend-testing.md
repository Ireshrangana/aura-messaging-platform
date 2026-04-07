# Backend Testing Scope

## Unit tests

- auth token issuance
- OTP lifecycle and throttling
- RBAC checks
- message send/edit/delete services
- moderation decision logic
- analytics aggregation helpers

## Integration tests

- signup/login flows
- refresh token rotation
- direct chat creation
- group membership updates
- message pagination and read receipts
- report creation and admin resolution

## Realtime tests

- message created fanout
- typing indicator presence
- read receipt updates
- admin live alerts for flagged content

