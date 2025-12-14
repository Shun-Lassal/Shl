import { BaseRepository } from "../../shared/base/index.ts";
import { NotFoundError } from "../../shared/errors.ts";
import type { User } from "../user/user.model.ts";

export class LoginRepository extends BaseRepository {
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError(`User with email ${email} not found`);
    }

    return user as User;
  }

  async exists(id: string): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  }

  async create(): Promise<any> {
    throw new Error("Create not implemented for LoginRepository");
  }

  async findById(): Promise<any> {
    throw new Error("FindById not implemented for LoginRepository");
  }

  async findAll(): Promise<any[]> {
    throw new Error("FindAll not implemented for LoginRepository");
  }

  async update(): Promise<any> {
    throw new Error("Update not implemented for LoginRepository");
  }

  async delete(): Promise<any> {
    throw new Error("Delete not implemented for LoginRepository");
  }
}
