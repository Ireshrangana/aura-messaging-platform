export interface ApiEnv {
  nodeEnv: string;
  appEnv: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAdminSecret: string;
  otpSigningSecret: string;
  openAiApiKey: string;
  adminIpAllowlist: string[];
}

export function loadEnv(source = process.env): ApiEnv {
  return {
    nodeEnv: source.NODE_ENV ?? "development",
    appEnv: source.APP_ENV ?? "local",
    port: Number(source.API_PORT ?? 4000),
    databaseUrl: source.DATABASE_URL ?? "",
    redisUrl: source.REDIS_URL ?? "",
    jwtAccessSecret: source.JWT_ACCESS_SECRET ?? "",
    jwtRefreshSecret: source.JWT_REFRESH_SECRET ?? "",
    jwtAdminSecret: source.JWT_ADMIN_SECRET ?? "",
    otpSigningSecret: source.OTP_SIGNING_SECRET ?? "",
    openAiApiKey: source.OPENAI_API_KEY ?? "",
    adminIpAllowlist: (source.ADMIN_IP_ALLOWLIST ?? "").split(",").filter(Boolean)
  };
}

