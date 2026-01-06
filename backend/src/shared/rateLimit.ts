import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import { config } from "./config;

const rateLimitFactory =
  (rateLimit as unknown as { default?: (options: unknown) => RateLimitRequestHandler }).default ??
  (rateLimit as unknown as (options: unknown) => RateLimitRequestHandler);

export const apiLimiter = rateLimitFactory({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
} as unknown);

export const authLimiter = rateLimitFactory({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
} as unknown);
