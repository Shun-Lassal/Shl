import { BaseRepository } from "../../shared/base/index.ts";
import { selectWithoutPassword } from "../../shared/fieldSelectors.ts";
import type { NewUser, User } from "./user.model.ts";

export class UserRepository extends BaseRepository {
  async findAll(options?: { skip?: number; take?: number }): Promise<User[]> {
    return this.db.user.findMany({
      ...options,
      omit: { password: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async findByName(name: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { name },
      omit: { password: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
      omit: { password: true },
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async create(data: NewUser): Promise<User> {
    return this.db.user.create({
      data,
      omit: { password: true },
    });
  }

  async update(id: string, data: { email?: string; name?: string }): Promise<User> {
    return this.db.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }

  async updatePassword(id: string, password: string): Promise<User> {
    return this.db.user.update({
      where: { id },
      data: { password },
      omit: { password: true },
    });
  }

  async delete(id: string): Promise<User> {
    return this.db.user.delete({
      where: { id },
      omit: { password: true },
    });
  }

  async exists(id: string): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  }
}
