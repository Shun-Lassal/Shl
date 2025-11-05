import { Router } from "express";
import { RegisterController } from "./register.controller";
import { isAdminMiddleware, isLoggedInMiddleware } from "../../middlewares/auth";

const router = Router();

// TODO: Ajouter un middleware pour vérifier si l'utilisateur possède le bon rôle
router.post('/', isLoggedInMiddleware, isAdminMiddleware, RegisterController.registerUser);

export default router;
