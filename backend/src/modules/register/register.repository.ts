import { BaseRepository } from "../../shared/base/index.js";
import { ConflictError } from "../../shared/errors.js";
import type { User } from "../user/user.model.js";

export class RegisterRepository extends BaseRepository {
  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  async checkNameExists(name: string): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: { name },
      select: { id: true },
    });
    return !!user;
  }

  async create(): Promise<any> {
    throw new Error("Create not implemented for RegisterRepository");
  }

  async findById(): Promise<any> {
    throw new Error("FindById not implemented for RegisterRepository");
  }

  async findAll(): Promise<any[]> {
    throw new Error("FindAll not implemented for RegisterRepository");
  }

  async update(): Promise<any> {
    throw new Error("Update not implemented for RegisterRepository");
  }

  async delete(): Promise<any> {
    throw new Error("Delete not implemented for RegisterRepository");
  }

  async exists(): Promise<boolean> {
    throw new Error("Exists not implemented for RegisterRepository");
  }
}
