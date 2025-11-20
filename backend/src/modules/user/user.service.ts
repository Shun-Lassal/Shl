import { Role } from '@prisma/client';
import { UserRepository } from './user.repository';
import { User } from './user.model';
import { comparePasswords } from '../../shared/bcrypt';

export class UserService {
  private repo: UserRepository;

  constructor() {
    this.repo = new UserRepository();
  }

  async getUsers() {
    return await this.repo.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    
    if (!id) {
      throw "User id is empty"
    }

    return await this.repo.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.repo.findByEmail(email);
  }

  async getUserByName(name: string): Promise<User | null> {
    return await this.repo.findByName(name);
  }
  
  async updateUser(id:string , user: User) {

    if (!id) {
      throw 'User id is empty'
    }

    if(!user) {
      throw "User isn't defined"
    }

    if(!user.email && !user.name)
    {
      throw "User email and name not defined"
    }

    return await this.repo.update(id, user);

  }

  async updatePassword(userId: string, newPassword: string, oldPassword: string) {
    // hash & vérifier old password

    if (!userId) {
      throw "UserId is empty"
    }

    if (!newPassword) {
      throw "New password is empty"
    }

    if (!oldPassword) {
      throw "Old password is empty"
    }

    const user: User | null = await this.getUserById(userId);
    if (!user?.id) {
      throw "User / UserId doesn't exist"
    }
  
    if (!user?.password)
    {
      throw "User password doesn't exist"
    }

    const passwordCompared = await comparePasswords(oldPassword, user?.password)
    if (!passwordCompared) {
      throw "Passwords aren't matching"
    }

    const passwordChanged: User | null = await this.repo.updatePassword(user.id, newPassword)
    if (!passwordChanged) {
      throw "User password has not been updated"
    }
  }

  async deleteUser(id: string) {
    if (!id) {
      throw "User id is empty"
    }

    const isDeleted: User | null = await this.repo.delete(id);
    if (!isDeleted) {
      throw "User has not been found"
    }
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
