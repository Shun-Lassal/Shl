import express from "express";
import { LoginController } from './login.controller.ts';
import { isLoggedInMiddleware } from '../../middlewares/auth.ts';

const router = express.Router();

// Todo : Ajouter un middleware d'anti-brute force ici

router.post('/', LoginController.loginUser);

router.post('/logout', isLoggedInMiddleware, LoginController.logoutUser);

export default router;
