import { RegisterService } from "../modules/register/register.service;
import { UserRepository } from .js"../modules/user/user.repository;
import { Role } from "@prisma/client";
import { config } from "./config;

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
    console.error(.js"Error Seeding default user :", e);
  }
}
