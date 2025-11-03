import { prisma } from '../../shared/prisma';

export class LoginRepository {
  async getUserPassword(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw 'User not found';
    }

    return user.password;
  }
}
