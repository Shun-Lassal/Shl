import { BaseService } from "../../shared/base/index.js";
import { ValidationError, NotFoundError } from "../../shared/errors.js";
import { UserRepository } from "./user.repository.js";
import { userSchema, newUserSchema } from "./user.model.js";
import type { User } from "./user.model.js";
import { comparePasswords } from "../../shared/bcrypt.js";

export class UserService extends BaseService {
  private repo: UserRepository;

  constructor() {
    super();
    this.repo = new UserRepository();
  }

  async getUsers(options?: { skip?: number; take?: number }): Promise<User[]> {
    return this.repo.findAll(options);
  }

  async getUserById(id: string): Promise<User> {
    const schema = userSchema.pick({ id: true });
    this.validate(schema, { id });

    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const schema = userSchema.pick({ email: true });
    this.validate(schema, { email });

    const user = await this.repo.findByEmail(email);
    if (!user) {
      throw new NotFoundError(`User with email ${email} not found`);
    }
    return user;
  }

  async getUserByName(name: string): Promise<User> {
    const schema = userSchema.pick({ name: true });
    this.validate(schema, { name });

    const user = await this.repo.findByName(name);
    if (!user) {
      throw new NotFoundError(`User with name ${name} not found`);
    }
    return user;
  }

  async updateUser(id: string, data: { email?: string; name?: string }): Promise<User> {
    // Validate id exists
    const schema = userSchema.pick({ id: true });
    this.validate(schema, { id });

    // Validate at least one field is provided
    if (!data.email && !data.name) {
      throw new ValidationError("At least one field (email or name) must be provided");
    }

    // Validate provided fields
    const updateSchema = userSchema.pick({ email: true, name: true }).partial();
    const validatedData = this.validate<{ email?: string; name?: string }>(updateSchema, data);

    // Check user exists
    const userExists = await this.repo.exists(id);
    if (!userExists) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    return this.repo.update(id, validatedData);
  }

  async updatePassword(
    userId: string,
    newPassword: string,
    oldPassword: string
  ): Promise<void> {
    // Validate inputs
    const schema = userSchema.pick({ id: true, password: true });
    this.validate(schema, { id: userId, password: newPassword });

    if (!oldPassword) {
      throw new ValidationError("Old password is required");
    }

    // Get user with password (internal method)
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with id ${userId} not found`);
    }

    // Get user with password for verification
    const userWithPassword = await this.repo.findByEmailWithPassword(user.email!);
    if (!userWithPassword?.password) {
      throw new ValidationError("User password not found");
    }

    // Verify old password
    const passwordMatch = await comparePasswords(oldPassword, userWithPassword.password);
    if (!passwordMatch) {
      throw new ValidationError("Old password is incorrect");
    }

    // Update password
    await this.repo.updatePassword(userId, newPassword);
  }

  async deleteUser(id: string): Promise<void> {
    const schema = userSchema.pick({ id: true });
    this.validate(schema, { id });

    const userExists = await this.repo.exists(id);
    if (!userExists) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    await this.repo.delete(id);
  }

  async createUser(data: {
    email: string;
    name: string;
    password: string;
    role: string;
  }): Promise<User> {
    const validatedData = this.validate<any>(newUserSchema, data);
    return this.repo.create(validatedData);
  }
}
