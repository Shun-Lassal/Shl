import { BaseService } from "../../shared/base/index.js";
import { ConflictError, ValidationError } from "../../shared/errors.js";
import { registerSchema } from "./register.model.js";
import type { Register } from "./register.model.js";
import { hashPassword } from "../../shared/bcrypt.js";
import { UserRepository } from "../user/user.repository.js";
import { RegisterRepository } from "./register.repository.js";
import { SessionService } from "../session/session.service.js";

export class RegisterService extends BaseService {
  private userRepo: UserRepository;
  private registerRepo: RegisterRepository;
  private sessionService: SessionService;

  constructor() {
    super();
    this.userRepo = new UserRepository();
    this.registerRepo = new RegisterRepository();
    this.sessionService = new SessionService();
  }

  async register(data: Register): Promise<{ sessionId: string; user: any }> {
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
    const user = await this.userRepo.create({
      email: validatedData.email,
      name: validatedData.name,
      password: hashedPassword,
      role: validatedData.role || "USER",
    });

    // Create session
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const sessionId = await this.sessionService.createSession(user.id!, expiresAt);

    // Return user without password
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { sessionId, user: userWithoutPassword };
  }
}
