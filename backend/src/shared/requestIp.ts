import type { Request } from "express";

export function getRequestIp(req: Request): string | null {
  const forwardedFor = req.headers["x-forwarded-for"];
  const candidate = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  if (typeof candidate === "string" && candidate.trim().length > 0) {
    const first = candidate.split(",")[0]?.trim();
    if (first) return first;
  }

  if (typeof req.ip === "string" && req.ip.trim().length > 0) {
    return req.ip.trim();
  }

  const remoteAddress = req.socket?.remoteAddress;
  return typeof remoteAddress === "string" && remoteAddress.trim().length > 0
    ? remoteAddress.trim()
    : null;
}
