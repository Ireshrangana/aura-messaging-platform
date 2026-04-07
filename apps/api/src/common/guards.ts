export interface GuardDefinition {
  name: string;
  purpose: string;
}

export const commonGuards: GuardDefinition[] = [
  { name: "JwtAuthGuard", purpose: "Protect user APIs with access tokens." },
  { name: "RefreshTokenGuard", purpose: "Rotate refresh tokens securely." },
  { name: "AdminJwtGuard", purpose: "Protect admin APIs with separate admin sessions." },
  { name: "RolesGuard", purpose: "Enforce RBAC and permission matrix for admin features." },
  { name: "IpAllowlistGuard", purpose: "Restrict admin access to approved source ranges." },
  { name: "ChatMemberGuard", purpose: "Ensure the current user belongs to the chat." }
];

