import { prisma } from "../../shared/prisma.ts";
import type { NewUser, User } from "./user.model.ts";

export class UserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany({ omit: { password: true } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  }

  async findByName(name: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { name }, omit: { password: true } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email }, omit: { password: true } });
  }

  async createUser(data: NewUser): Promise<User | null> {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role
      }
    })
  }

  async update(
    id: string,
    data: { email?: string; name?: string; }
  ) {
    return prisma.user.update({ where: { id }, data });
  }

  async updatePassword(id: string, password: string) {
    return prisma.user.update({ where: { id }, data: { password: password } })
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
