import { prisma } from '../../shared/prisma';

export class SessionRepository {
  async create(data: { userId: number; token: string; expiresAt: Date }) {
    return prisma.session.create({ data });
  }

  async findByUserId(userId: number) {
    return prisma.session.findUnique({ where: { userId } });
  }

  async findByToken(token: string) {
    return prisma.session.findUnique({ where: { token } });
  }

  async deleteByUserId(userId: number) {
    return prisma.session.delete({ where: { userId } });
  }

  async updateExpirationDate(userId: number, expiresAt: Date) {
    return prisma.session.updateMany({
      where: { userId },
      data: { expiresAt },
    });
  }
}
