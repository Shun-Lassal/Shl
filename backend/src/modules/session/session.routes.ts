import express from "express";
import { SessionController } from "./session.controller.ts";
import { isLoggedInMiddleware } from "../../middlewares/auth.ts";

const router = express.Router();

// router.post("/", SessionController.createSession);
router.get('/', isLoggedInMiddleware, SessionController.getSessions)

export default router;
