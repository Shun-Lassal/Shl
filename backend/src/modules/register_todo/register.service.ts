import { Register } from './register.model';
import { hashPassword } from '../../shared/bcrypt';
import { RegisterRepository } from './register.repository';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';

export class RegisterService {

  async register(user: Register): Promise<boolean> {
    const { email, name, password, role } = user;
    const userService = new UserService(); 
    const userRepository = new UserRepository();
    const existingEmailUser = await userService.getUserByEmail(email);
    const existingNameUser = await userService.getUserByName(name);

    if (existingEmailUser?.email == email) {
      throw "User email already exists"
    }

    if (existingNameUser?.name == name) {
      throw "User name already exists"
    }
    
    const hashedPassword = await hashPassword(password);
    const newUser = await userRepository.createUser(
      { email, name, password: hashedPassword, role: role ? role : "USER" });
    return true;
  }
  
}