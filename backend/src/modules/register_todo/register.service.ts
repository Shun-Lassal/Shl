import { Register } from './register.model';
import { UserService } from '../user/user.service';
import { hashPassword } from '../../shared/bcrypt';

export class RegisterService {

  async register(user: Register): Promise<boolean> {
    const { email, name, password } = user;
    const userService = new UserService();
    const existingUser = await userService.getUserByEmail(email);
    if (!existingUser) {
      const hashedPassword = await hashPassword(password);
      const newUser = await userService.createUser({ email, name, password: hashedPassword });
      if (newUser) {
        return true;
      }
    }
    return false;
  }
  
}