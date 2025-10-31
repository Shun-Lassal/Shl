import { UserRepository } from './user.repository';

export class UserService {
  private repo: UserRepository;

  constructor() {
    this.repo = new UserRepository();
  }

  async getUsers() {
    return this.repo.findAll();
  }

  async getUserByEmail(email: string) {
    const user = await this.repo.findByEmail(email);
    return user;
  }

  async createUser(data: { email: string; name: string; password: string }) {
    return this.repo.create(data);
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