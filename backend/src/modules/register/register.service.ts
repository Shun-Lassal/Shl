import { BaseService } from "../../shared/base/index.ts";
import { ConflictError, ValidationError } from "../../shared/errors.ts";
import { registerSchema } from "./register.model.ts";
import type { Register } from "./register.model.ts";
import { hashPassword } from "../../shared/bcrypt.ts";
import { UserRepository } from "../user/user.repository.ts";
import { RegisterRepository } from "./register.repository.ts";

export class RegisterService extends BaseService {
  private userRepo: UserRepository;
  private registerRepo: RegisterRepository;

  constructor() {
    super();
    this.userRepo = new UserRepository();
    this.registerRepo = new RegisterRepository();
  }

  async register(data: Register): Promise<void> {
    // Validate input
    const validatedData = this.validate<Register>(registerSchema, data);

    // Check if email already exists
    const emailExists = await this.registerRepo.checkEmailExists(validatedData.email);
    if (emailExists) {
      throw new ConflictError(`User with email ${validatedData.email} already exists`);
    }

    // Check if name already exists
    const nameExists = await this.registerRepo.checkNameExists(validatedData.name);
    if (nameExists) {
      throw new ConflictError(`User with name ${validatedData.name} already exists`);
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    await this.userRepo.create({
      email: validatedData.email,
      name: validatedData.name,
      password: hashedPassword,
      role: validatedData.role,
    });
  }
}
