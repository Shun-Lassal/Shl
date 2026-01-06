import { RegisterService } from "../modules/register/register.service.ts";
import { UserRepository } from "../modules/user/user.repository.ts";
import { Role } from "@prisma/client";
import { config } from "./config.ts";

const userRepository = new UserRepository();

export async function seedDefaultUser() {
  try {
    const { email, name, password } = config.defaultUser;
    const existing = await userRepository.findByEmail(email);
    if (!existing) {
      const registerService = new RegisterService();
      await registerService.register({
        email,
        name,
        password,
        role: Role.ADMIN,
      });
      console.log(`[seed] Utilisateur par défaut créé: ${email}`);
    }
  } catch (e) {
    console.error("Error Seeding default user :", e);
  }
}
