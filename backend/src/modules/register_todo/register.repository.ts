import { Role } from '@prisma/client';
import { prisma } from '../../shared/prisma';

export class RegisterRepository {

  async createUser(data: { email: string; name: string; password: string; role: Role }) {
    return prisma.user.create({ data });
  }

}
