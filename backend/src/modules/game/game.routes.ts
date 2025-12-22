import express from "express";
import { isLoggedInMiddleware } from "../../middlewares/auth.ts";
import { GameController } from "./game.controller.ts";

const router = express.Router();

router.get("/:lobbyId", isLoggedInMiddleware, GameController.getGameByLobby);

export default router;

