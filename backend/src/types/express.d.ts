declare global {
  namespace Express {
    interface Locals {
      userId?: string;
      sessionId?: string;
    }
  }
}

export {};
