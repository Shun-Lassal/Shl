import express from "express";
import { GameScoreController } from "./gameScore.controller.ts";
import { isAdminMiddleware, isLoggedInMiddleware } from "../../middlewares/auth.ts";

const router = express.Router();

router.get("/", isLoggedInMiddleware, GameScoreController.listGameScores);
router.get("/:id", isLoggedInMiddleware, GameScoreController.getGameScore);
router.post("/", isLoggedInMiddleware, isAdminMiddleware, GameScoreController.createGameScore);
router.patch("/:id", isLoggedInMiddleware, isAdminMiddleware, GameScoreController.updateGameScorePosition);
router.delete("/:id", isLoggedInMiddleware, isAdminMiddleware, GameScoreController.deleteGameScore);

export default router;
