import { z } from "zod";

const parseOrigins = (value?: string): string[] =>
  (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().optional(),
  COOKIE_SECRET: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  TRUST_PROXY: z.coerce.number().int().nonnegative().optional(),
  ENABLE_SWAGGER: z.string().optional(),
  SEED_DEFAULT_USER: z.string().optional(),
  DEFAULT_USER_EMAIL: z.string().optional(),
  DEFAULT_USER_NAME: z.string().optional(),
  DEFAULT_USER_PASSWORD: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_AUTH_WINDOW_MS: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().optional(),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid environment configuration", error.flatten().fieldErrors);
    }
    throw error;
  }
};

const rawEnv = parseEnv();
const normalize = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};
const isProd = rawEnv.NODE_ENV === "production";

const requireSecret = (value: string | undefined, name: string): string => {
  if (!value || value.length < 32) {
    throw new Error(`${name} must be set and at least 32 characters long`);
  }
  return value;
};

const cookieSecretValue = normalize(rawEnv.COOKIE_SECRET);
const cookieSecret = isProd
  ? requireSecret(cookieSecretValue, "COOKIE_SECRET")
  : cookieSecretValue ?? "dev-cookie-secret-change-me";

const jwtSecretValue = normalize(rawEnv.JWT_SECRET);
const jwtSecret = isProd
  ? requireSecret(jwtSecretValue, "JWT_SECRET")
  : jwtSecretValue ?? "dev-jwt-secret-change-me";

const corsOrigins = parseOrigins(normalize(rawEnv.CORS_ORIGIN));
if (isProd && corsOrigins.length === 0) {
  throw new Error("CORS_ORIGIN must be set in production");
}

const seedDefaultUserValue = normalize(rawEnv.SEED_DEFAULT_USER);
const seedDefaultUser =
  seedDefaultUserValue === "true" || (!isProd && seedDefaultUserValue !== "false");

const defaultUserEmail = normalize(rawEnv.DEFAULT_USER_EMAIL) ?? "admin@admin.com";
const defaultUserName = normalize(rawEnv.DEFAULT_USER_NAME) ?? "admin";
const defaultUserPassword = normalize(rawEnv.DEFAULT_USER_PASSWORD) ?? "admin123456";

if (isProd && seedDefaultUser) {
  if (!normalize(rawEnv.DEFAULT_USER_EMAIL) || !normalize(rawEnv.DEFAULT_USER_PASSWORD)) {
    throw new Error("DEFAULT_USER_EMAIL and DEFAULT_USER_PASSWORD must be set when seeding in production");
  }
  if (defaultUserPassword.length < 12) {
    throw new Error("DEFAULT_USER_PASSWORD must be at least 12 characters in production");
  }
}

const enableSwaggerValue = normalize(rawEnv.ENABLE_SWAGGER);
const enableSwagger =
  enableSwaggerValue === "true" || (!isProd && enableSwaggerValue !== "false");

export const config = {
  env: rawEnv.NODE_ENV,
  isProd,
  host: rawEnv.HOST,
  port: rawEnv.PORT,
  trustProxy: rawEnv.TRUST_PROXY ?? (isProd ? 1 : 0),
  corsOrigins,
  allowAnyOrigin: !isProd && corsOrigins.length === 0,
  cookieSecret,
  jwtSecret,
  enableSwagger,
  seedDefaultUser,
  defaultUser: {
    email: defaultUserEmail,
    name: defaultUserName,
    password: defaultUserPassword,
  },
  rateLimit: {
    windowMs: rawEnv.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000,
    max: rawEnv.RATE_LIMIT_MAX ?? 200,
    authWindowMs: rawEnv.RATE_LIMIT_AUTH_WINDOW_MS ?? 15 * 60 * 1000,
    authMax: rawEnv.RATE_LIMIT_AUTH_MAX ?? 20,
  },
};
