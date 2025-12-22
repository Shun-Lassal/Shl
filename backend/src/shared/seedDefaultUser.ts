import { RegisterService } from '../modules/register/register.service.ts';
import { UserRepository } from '../modules/user/user.repository.ts';
import { Role } from '@prisma/client';

const userRepository = new UserRepository();

export async function seedDefaultUser() {
    try {
        const email = process.env.DEFAULT_USER_EMAIL ?? "admin@admin.com";
        const name = process.env.DEFAULT_USER_NAME ?? "admin";
        const password = process.env.DEFAULT_USER_PASSWORD ?? "admin123456";
        
        const existing = await userRepository.findByEmail(email);
        if (!existing) {
            const registerService = new RegisterService();
            await registerService.register({
                email, 
                name, 
                password,
                role: Role.ADMIN
            });
            console.log(`[seed] Utilisateur par défaut créé: ${email}`);
        }
    }
    catch (e){
        console.error("Error Seeding default user :", e)
    }
}