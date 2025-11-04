import { Router } from "express";
import { SessionController } from "./session.controller";
import { isLoggedInMiddleware } from "../../middlewares/auth";

const router = Router();

// router.post("/", SessionController.createSession);
router.get('/', isLoggedInMiddleware, SessionController.getSessions)

export default router;
