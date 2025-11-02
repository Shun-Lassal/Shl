import { Router } from "express";
import { RegisterController } from "./register.controller";

const router = Router();

// TODO: Ajouter un middleware pour vérifier si l'utilisateur possède le bon rôle
router.post('/', RegisterController.registerUser);

export default router;
