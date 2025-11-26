import { Router } from 'express';
import { LoginController } from './login.controller.js';
import { isLoggedInMiddleware } from '../../middlewares/auth.js';

const router = Router();

// Todo : Ajouter un middleware d'anti-brute force ici

router.post('/', LoginController.loginUser);

router.post('/logout', isLoggedInMiddleware, LoginController.logoutUser);

export default router;
