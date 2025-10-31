import { Router } from 'express';
import { LoginController } from './login.controller';

const router = Router();

// Todo : Ajouter un middleware d'anti-brute force ici
router.post('/', LoginController.loginUser);
router.post('/logout', LoginController.logoutUser);

export default router;