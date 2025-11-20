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

export type NewUser = Required<Pick<User, 'email' | 'name' | 'password' | 'role'>>;
