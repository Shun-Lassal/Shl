import type { User } from "../user/user.model.ts";

export interface Session {
    id: string;
    userId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
