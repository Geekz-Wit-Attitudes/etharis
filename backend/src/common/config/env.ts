type EnvKey =
  | "NODE_ENV"
  | "FRONTEND_URL"
  | "JWT_SECRET"
  | "DATABASE_URL"
  | "SMTP_USER"
  | "SMTP_PASSWORD"
  | "VAULT_ADDR"
  | "VAULT_TOKEN"
  | "MINIO_ENDPOINT"
  | "MINIO_BUCKET_NAME"
  | "MINIO_ACCESS_KEY"
  | "MINIO_SECRET_KEY";

// Utility to safely get environment variables with fallbacks and validation.
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
  nodeEnv: getEnv("NODE_ENV", "development"),

  frontEndUrl: getEnv("FRONTEND_URL", "http://localhost:3000"),
  databaseUrl: getEnv("DATABASE_URL"),

  jwtSecret: getEnv("JWT_SECRET"),

  smtpUser: getEnv("SMTP_USER"),
  smtpPassword: getEnv("SMTP_PASSWORD"),

  vaultAddr: getEnv("VAULT_ADDR"),
  vaultToken: getEnv("VAULT_TOKEN"),

  minioEndpoint: getEnv("MINIO_ENDPOINT", "http://localhost:9000"),
  minioBucket: getEnv("MINIO_BUCKET_NAME", "dev-etharis"),
  minioAccessKey: getEnv("MINIO_ACCESS_KEY", "minioadmin"),
  minioSecretKey: getEnv("MINIO_SECRET_KEY", "minioadmin"),
};
