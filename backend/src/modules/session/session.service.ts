import { BaseService } from "../../shared/base/index.js";
import { ValidationError, NotFoundError } from "../../shared/errors.js";
import { sessionSchema } from "./session.model.js";
import type { Session } from "./session.model.js";
import { SessionRepository } from "./session.repository.js";

export class SessionService extends BaseService {
  private repository: SessionRepository;

  constructor() {
    super();
    this.repository = new SessionRepository();
  }

  async createSession(userId: string, expiresAt: Date): Promise<string> {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    if (!expiresAt) {
      throw new ValidationError("Expiration date is required");
    }

    // Delete existing session for this user if any
    await this.repository.deleteByUserId(userId);

    // Create new session
    const session = await this.repository.create({ userId, expiresAt });
    return session.id;
  }

  async getAllSessions(): Promise<Session[]> {
    return this.repository.findAll();
  }

  async getSessionBySessionId(sessionId: string): Promise<Session> {
    if (!sessionId) {
      throw new ValidationError("Session ID is required");
    }
    return this.repository.findById(sessionId);
  }

  async getSessionByUserId(userId: string): Promise<Session | null> {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }
    return this.repository.findByUserId(userId);
  }

  async deleteSessionBySessionId(sessionId: string): Promise<void> {
    if (!sessionId) {
      throw new ValidationError("Session ID is required");
    }

    const exists = await this.repository.exists(sessionId);
    if (!exists) {
      throw new NotFoundError(`Session ${sessionId} not found`);
    }

    await this.repository.delete(sessionId);
  }

  async deleteSessionsByUserId(userId: string): Promise<void> {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }
    await this.repository.deleteByUserId(userId);
  }

  async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<Session> {
    if (!sessionId) {
      throw new ValidationError("Session ID is required");
    }

    if (!expiresAt) {
      throw new ValidationError("Expiration date is required");
    }

    return this.repository.update(sessionId, { expiresAt });
  }
}
