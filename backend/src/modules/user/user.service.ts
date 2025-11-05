import { Role } from '@prisma/client';
import { UserRepository } from './user.repository';
import { User } from './user.model';

export class UserService {
  private repo: UserRepository;

  constructor() {
    this.repo = new UserRepository();
  }

  async getUsers() {
    return await this.repo.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.repo.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.repo.findByEmail(email);
  }

  async getUserByName(name: string): Promise<User | null> {
    return await this.repo.findByName(name);
  }
  
  async updatePassword(userId: string, newPassword: string, oldPassword: string) {
    // hash & vérifier old password
    // return await this.repo.updatePassword(newPassword);
  }
  // async getUser(id: number) {
  //   const user = await this.repo.findById(id);
  //   if (!user) throw new Error('User not found');
  //   return user;
  // }

  // async createUser(email: string, name: string) {
  //   // exemple logique métier : vérifier email unique
  //   const existing = await this.repo.findAll();
  //   if (existing.some(u => u.email === email)) {
  //     throw new Error('Email already used');
  //   }
  //   return this.repo.create({ email, name });
  // }
}
