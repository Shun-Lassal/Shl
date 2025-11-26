import { Router } from "express";
import { SessionController } from "./session.controller.js";
import { isLoggedInMiddleware } from "../../middlewares/auth.js";

const router = Router();

// router.post("/", SessionController.createSession);
router.get('/', isLoggedInMiddleware, SessionController.getSessions)

export default router;
