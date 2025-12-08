import type { Login } from './login.model.ts';
import { UserService } from '../user/user.service.ts';
import { comparePasswords } from '../../shared/bcrypt.ts';
import { SessionService } from '../session/session.service.ts';
import { LoginRepository } from './login.repository.ts';
import type { User } from '../user/user.model.ts';

export class LoginService {

  async authenticate(user: Login): Promise<string | false> {
    const { email, password } = user;
    if(!email || email.length > 128 || email.length < 10) {
      throw "Throw: email empty, >128 or <10"
    }

    // PASSWORD A 4 POUR LE MOMENT MAIS A CHANGER EN PROD
    if (!password || password.length > 128 || password.length < 4) {
      throw "Throw: Password empty, >128 or <10"
    }
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

  async logout(sessionId: string): Promise<boolean> {
    const sessionService = new SessionService();
    return sessionService.deleteSessionBySessionId(sessionId);
  }
  
}
