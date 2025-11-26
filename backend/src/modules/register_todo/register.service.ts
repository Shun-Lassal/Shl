import { Register } from './register.model.js';
import { hashPassword } from '../../shared/bcrypt.js';
import { UserService } from '../user/user.service.js';
import { UserRepository } from '../user/user.repository.js';
// Devrais utiliser le model NewUser de userModel.js
import { User } from '../user/user.model.js';

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

    if (password.length < 3) {
      throw "Password is too short"
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await userRepository.createUser(
      { email, name, password: hashedPassword, role: role ? role : "USER" });
    if (!newUser) {
      throw "New user haven't been created"
    }
    return true;
  }
  
}