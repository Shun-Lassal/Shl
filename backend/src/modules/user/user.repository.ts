import { prisma } from '../../shared/prisma';

export class UserRepository {
  async findAll() {
    return prisma.user.findMany();
  }

  async findByName(name: string) {
    return prisma.user.findMany({ where: { name } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create (data: { email: string; name: string, password: string }) {
    return prisma.user.create({ data });
  }

  async update(id: number, data: { email?: string; name?: string; password?: string }) {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.user.delete({ where: { id } });
  }
}