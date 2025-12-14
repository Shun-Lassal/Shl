import express from "express";
import { LobbyController } from "./lobby.controller.ts";
import { isAdminMiddleware, isLoggedInMiddleware } from "../../middlewares/auth.ts";

const router = express.Router();

router.get("/", isLoggedInMiddleware, LobbyController.listLobbies);
router.get("/:id", isLoggedInMiddleware, LobbyController.getLobbyById);
router.post("/", isLoggedInMiddleware, isAdminMiddleware, LobbyController.createLobby);
router.patch("/:id", isLoggedInMiddleware, isAdminMiddleware, LobbyController.updateLobby);
router.put("/:id/players", isLoggedInMiddleware, isAdminMiddleware, LobbyController.setLobbyPlayers);
router.post("/:id/players", isLoggedInMiddleware, isAdminMiddleware, LobbyController.addPlayerToLobby);
router.delete("/:id/players/:playerId", isLoggedInMiddleware, isAdminMiddleware, LobbyController.removePlayerFromLobby);
router.delete("/:id", isLoggedInMiddleware, isAdminMiddleware, LobbyController.deleteLobby);

export default router;
