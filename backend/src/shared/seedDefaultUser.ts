import { RegisterService } from '../modules/register/register.service.ts';
import { UserRepository } from '../modules/user/user.repository.ts';
import { hashPassword } from './bcrypt.ts';

const registerService = new RegisterService();
const userRepository = new UserRepository();

export async function seedDefaultUser() {
    try {
        const email = process.env.DEFAULT_USER_EMAIL ?? "admin@admin.com";
        const password = process.env.DEFAULT_USER_PASSWORD ?? "admin";
        
        const existing = await userRepository.findByEmail(email);
        if (!existing) {
            const hash = await hashPassword(password)
            const isRegistered = await registerService.register({email: email, name: "admin", password: password, role: "ADMIN"})
            if(isRegistered) {
                console.log(`[seed] Utilisateur par défaut créé: ${email}`);
            }
        }
    }
    catch (e){
        console.error("Error Seeding default user :", e)
    }
}