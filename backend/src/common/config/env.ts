// src/config/env.ts
type EnvKey =
  | "FRONTEND_URL"
  | "SMTP_USER"
  | "SMTP_PASSWORD"
  | "JWT_SECRET"
  | "DATABASE_URL";

/**
 * Utility to safely get environment variables with fallbacks and validation.
 */
function getEnv(key: EnvKey, fallback?: string): string {
  const value = Bun.env[key];

  if (value && value.trim() !== "") {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`❌ Missing required environment variable: ${key}`);
}

export const env = {
  frontEndUrl: getEnv("FRONTEND_URL", "http://localhost:3000"),
  smtpUser: getEnv("SMTP_USER"),
  smtpPassword: getEnv("SMTP_PASSWORD"),
  jwtSecret: getEnv("JWT_SECRET"),
  databaseUrl: getEnv("DATABASE_URL"),
};
