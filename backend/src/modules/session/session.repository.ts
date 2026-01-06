import { BaseRepository } from "../../shared/base/index.js";
import { NotFoundError } from "../../shared/errors.js";
import type { Session } from "./session.model.js";

export class SessionRepository extends BaseRepository {
  async create(data: { userId: string; expiresAt: Date }): Promise<Session> {
    return this.db.session.create({ data });
  }

  async findAll(): Promise<Session[]> {
    return this.db.session.findMany();
  }

  async findById(id: string): Promise<Session> {
    const session = await this.db.session.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundError(`Session ${id} not found`);
    }
    return session;
  }

  async findByUserId(userId: string): Promise<Session | null> {
    return this.db.session.findUnique({ where: { userId } });
  }

  async delete(id: string): Promise<Session> {
    return this.db.session.delete({ where: { id } });
  }

  async deleteByUserId(userId: string): Promise<Session | null> {
    return this.db.session.delete({ where: { userId } }).catch(() => null);
  }

  async update(id: string, data: { expiresAt: Date }): Promise<Session> {
    return this.db.session.update({
      where: { id },
      data,
    });
  }

  async exists(id: string): Promise<boolean> {
    const session = await this.db.session.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!session;
  }
}
