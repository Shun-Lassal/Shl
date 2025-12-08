import type { Session } from "./session.model.ts";
import { SessionRepository } from "./session.repository.ts";

export class SessionService {
  private repository: SessionRepository;

  constructor() {
    this.repository = new SessionRepository();
  }
  
  async createSession(userId: string, expiresAt: Date) {
    const existingSession = await this.repository.findByUserId(userId);
    if (existingSession) {
      await this.repository.deleteByUserId(userId);
    }
    const session = await this.repository.create({ userId, expiresAt });
    if (!session) {
      throw "Session could not be created";
    }

    return session.id;
  }

  async getAllSessions() {
    return this.repository.findAllSessions()
  }

  async getSessionBySessionId(sessionId: string) {
    return this.repository.findBySessionId(sessionId);
  }

  async getSessionByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async deleteSessionsByUserId(userId: string) {
    return this.repository.deleteByUserId(userId);
  }

  async deleteSessionBySessionId(sessionId: string) {
    const existingSession: Session | null = await this.repository.findBySessionId(sessionId);
    if (!existingSession) {
      return false;
    }

    await this.repository.deleteBySessionId(sessionId);
    return true;
  }
  
  async updateSessionExpiration(sessionId: string, expiresAt: Date) {
    return this.repository.updateExpirationDate(sessionId, expiresAt);
  }

}
