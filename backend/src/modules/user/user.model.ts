import { Role } from '@prisma/client';

export interface User {
  id?: string;
  email?: string;
  name?: string;
  password?: string;
  role?: Role;
  createdAt?: Date;
  updatedAt?: Date;
}

// Require the fields needed to create a user
export type NewUser = Required<Pick<User, 'email' | 'name' | 'password' | 'role'>>;
