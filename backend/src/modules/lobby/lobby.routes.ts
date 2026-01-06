import express from "express";
import { LobbyController } from "./lobby.controller.js";
import { isAdminMiddleware, isLoggedInMiddleware } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", isLoggedInMiddleware, LobbyController.listLobbies);
router.get("/:id", isLoggedInMiddleware, LobbyController.getLobbyById);
router.post("/", isLoggedInMiddleware, LobbyController.createLobby);
router.patch("/:id", isLoggedInMiddleware, LobbyController.updateLobby);
router.put("/:id/players", isLoggedInMiddleware, LobbyController.setLobbyPlayers);
router.post("/:id/players", isLoggedInMiddleware, LobbyController.addPlayerToLobby);
router.delete("/:id/players/:playerId", isLoggedInMiddleware, LobbyController.removePlayerFromLobby);
router.delete("/:id", isLoggedInMiddleware, LobbyController.deleteLobby);

export default router;
