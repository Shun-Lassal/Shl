import type { Register } from "./register.model.ts";
import { hashPassword } from "../../shared/bcrypt.ts";
import { UserService } from "../user/user.service.ts";
import { UserRepository } from "../user/user.repository.ts";
// Devrais utiliser le model NewUser de userModel.ts
import type { User } from "../user/user.model.ts";

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
