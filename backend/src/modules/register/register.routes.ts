import express from "express";
import { RegisterController } from "./register.controller.ts";

const router = express.Router();

// Public endpoint - registration should be accessible to anyone
router.post("/", RegisterController.registerUser);

export default router;
