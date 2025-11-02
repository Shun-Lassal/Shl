import { Role } from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { User } from './user.model';

export class UserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany({ omit: { password: true } });
  }

  async findByName(name: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { name }, omit: { password: true } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email }, omit: { password: true } });
  }

  async update(
    id: number,
    data: { email?: string; name?: string; password?: string; role?: Role }
  ) {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.user.delete({ where: { id } });
  }
}
