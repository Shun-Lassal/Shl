import { prisma } from '../../shared/prisma';

export class LoginRepository {
  async getUserPassword(userId: number): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.password;
  }
}
