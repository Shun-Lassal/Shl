import { BaseService } from "./base/index.ts";
import { ValidationError, NotFoundError } from "./errors.ts";
import { SessionRepository } from "../modules/session/session.repository.ts";
import { sessionSchema } from "../modules/session/session.model.ts";
import type { Session } from "../modules/session/session.model.ts";
import { z } from "zod";

export class sessionCookieChecker extends BaseService {
    private repo: SessionRepository;

    constructor() {
        super();
        this.repo = new SessionRepository();
    }

    async getSessionFromCookie(sessionCookie: string): Promise<Session> {
        // Validate session cookie is provided
        const schema = z.object({
            sessionId: z.string().uuid("Session cookie must be a valid UUID"),
        });
        this.validate(schema, { sessionId: sessionCookie });

        // Get session from database
        try {
            const session = await this.repo.findById(sessionCookie);
            return session;
        } catch (error) {
            throw new NotFoundError("Session not found or expired");
        }
    }

    async isSessionValid(session: Session): Promise<boolean> {
        // Validate session object
        const schema = sessionSchema.pick({ id: true, expiresAt: true });
        this.validate(schema, { id: session.id, expiresAt: session.expiresAt });

        if (!session.expiresAt) {
            throw new ValidationError("Session expiration date is required");
        }

        const currDate = Date.now();
        const expiresTs = new Date(session.expiresAt).getTime();

        // Check if session has expired
        if (currDate > expiresTs) {
            return false;
        }

        const EXTEND_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
        const remainingMs = expiresTs - currDate;

        // Extend session if less than 5 minutes remaining
        if (remainingMs < 5 * 60 * 1000) {
            const newExpiry = new Date(currDate + EXTEND_MS);
            await this.repo.update(session.id, { expiresAt: newExpiry });
        }

        return true;
    }
}
