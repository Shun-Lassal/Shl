import { Login } from './login.model';
import { UserService } from '../user/user.service';
import { comparePasswords } from '../../shared/bcrypt';
import { generateToken, verifyToken } from '../../shared/jwt';
import { SessionService } from '../session/session.service';

export class LoginService {

  async authenticate(user: Login): Promise<string | false> {
    const { email, password } = user;
    const userService = new UserService();
    const sessionService = new SessionService();
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser && await comparePasswords(password, existingUser.password)) {
      const token = generateToken({ userId: existingUser.id, email: existingUser.email });
      sessionService.createSession(existingUser.id, token, new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes
      return token;
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
