import { prisma } from '../../shared/prisma';

export class SessionRepository {
  async create(data: { userId: string; expiresAt: Date }) {
    return prisma.session.create({ data });
  }

  async findAllSessions() {
    return prisma.session.findMany();
  }

  async findBySessionId(id: string) {
    return prisma.session.findUnique({ where: { id } });
  }

  async findByUserId(userId: string) {
    return prisma.session.findUnique({ where: { userId } });
  }

  async deleteByUserId(userId: string) {
    return prisma.session.delete({ where: { userId } });
  }

  async updateExpirationDate(id: string, expiresAt: Date) {
    return prisma.session.update({
      where: { id },
      data: { expiresAt },
    });
  }
}
