import { Login } from './login.model';
import { UserService } from '../user/user.service';
import { comparePasswords } from '../../shared/bcrypt';
import { generateToken, verifyToken } from '../../shared/jwt';
import { SessionService } from '../session/session.service';
import { LoginRepository } from './login.repository';
import { User } from '../user/user.model';

export class LoginService {

  async authenticate(user: Login): Promise<string | false> {
    const { email, password } = user;
    const userService = new UserService();
    const sessionService = new SessionService();
    const loginService = new LoginRepository();
    const existingUser: User | null = await userService.getUserByEmail(email);

    if (!existingUser?.id || !existingUser.email) {
      return false;
    }

    const hashedPassword: string = await loginService.getUserPassword(existingUser.id);
    if (await comparePasswords(password, hashedPassword)) {
      const sessionId = await sessionService.createSession(existingUser.id, new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes
      return sessionId;
    }
    return false;
  }

  async logout(token: string): Promise<void> {
    const sessionService = new SessionService();
    const { userId } = verifyToken(token);
    if (userId) {
      await sessionService.deleteSessionsByUserId(userId);
    }
  }
  
}
