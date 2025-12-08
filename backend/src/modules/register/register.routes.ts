import express from "express";
import { RegisterController } from "./register.controller.ts";
import {
  isAdminMiddleware,
  isLoggedInMiddleware,
} from "../../middlewares/auth.ts";

const router = express.Router();

// TODO: Ajouter un middleware pour vérifier si l'utilisateur possède le bon rôle
router.post("/", isLoggedInMiddleware, isAdminMiddleware, RegisterController.registerUser);

export default router;
