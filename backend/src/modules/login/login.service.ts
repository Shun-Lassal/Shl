import { BaseService } from "../../shared/base/index.js";
import { ValidationError } from "../../shared/errors.js";
import { loginSchema } from "./login.model.js";
import type { Login } from "./login.model.js";
import { comparePasswords } from "../../shared/bcrypt.js";
import { UserRepository } from "../user/user.repository.js";
import { SessionService } from "../session/session.service.js";

export class LoginService extends BaseService {
  private userRepo: UserRepository;
  private sessionService: SessionService;

  constructor() {
    super();
    this.userRepo = new UserRepository();
    this.sessionService = new SessionService();
  }

  async authenticate(credentials: Login): Promise<{ sessionId: string; user: any }> {
    // Validate credentials
    const validatedData = this.validate<Login>(loginSchema, credentials);

    // Get user by email
    const user = await this.userRepo.findByEmailWithPassword(validatedData.email);
    if (!user) {
      throw new ValidationError("Invalid email or password");
    }

    if (!user.password) {
      throw new ValidationError("Invalid email or password");
    }

    // Compare passwords
    const isPasswordValid = await comparePasswords(validatedData.password, user.password);
    if (!isPasswordValid) {
      throw new ValidationError("Invalid email or password");
    }

    // Create session
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const sessionId = await this.sessionService.createSession(user.id!, expiresAt);

    // Return user without password
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { sessionId, user: userWithoutPassword };
  }

  async logout(sessionId: string): Promise<void> {
    if (!sessionId) {
      throw new ValidationError("Session ID is required");
    }

    await this.sessionService.deleteSessionBySessionId(sessionId);
  }
}
