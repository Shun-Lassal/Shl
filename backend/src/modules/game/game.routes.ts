import express from "express";
import { isLoggedInMiddleware } from "../../middlewares/auth.js";
import { GameController } from "./game.controller.js";

const router = express.Router();

router.get("/:lobbyId", isLoggedInMiddleware, GameController.getGameByLobby);

export default router;

