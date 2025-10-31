import { SessionRepository } from "./session.repository";

export class SessionService {
  private repository: SessionRepository;

  constructor() {
    this.repository = new SessionRepository();
  }
  
  async createSession(userId: number, token: string, expiresAt: Date) {
    return this.repository.create({ userId, token, expiresAt });
  }

  async getSessionByUserId(userId: number) {
    return this.repository.findByUserId(userId);
  }

  async getSessionByToken(token: string) {
    return this.repository.findByToken(token);
  }

  async deleteSessionsByUserId(userId: number) {
    return this.repository.deleteByUserId(userId);
  }
  
  async updateSessionExpiration(userId: number, expiresAt: Date) {
    return this.repository.updateExpirationDate(userId, expiresAt);
  }

}
