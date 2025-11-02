import { Role } from '@prisma/client';

export interface User {
  id?: number;
  email?: string;
  name?: string;
  password?: string;
  role?: Role;
  createdAt?: Date;
  updatedAt?: Date;
}
