import { SessionRepository } from "./session.repository";

export class SessionService {
  private repository: SessionRepository;

  constructor() {
    this.repository = new SessionRepository();
  }
  
  async createSession(userId: string, expiresAt: Date) {
    const session = await this.repository.create({ userId, expiresAt });
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
  
  async updateSessionExpiration(userId: string, expiresAt: Date) {
    return this.repository.updateExpirationDate(userId, expiresAt);
  }

}
