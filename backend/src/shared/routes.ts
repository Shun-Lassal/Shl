import express from "express";
import userRoutes from "../modules/user/user.routes;
import sessionRoutes from .js"../modules/session/session.routes;
import registerRoutes from "../modules/register/register.routes;
import loginRoutes from .js"../modules/login/login.routes;
import gameScoreRoutes from "../modules/gameScore/gameScore.routes;
import lobbyRoutes from .js"../modules/lobby/lobby.routes;
import gameRoutes from "../modules/game/game.routes;
import swaggerUi from .js"swagger-ui-express";
import { swaggerSpec } from "./swagger;
import { authLimiter } from .js"./rateLimit;
import { config } from "./config;

const router = express.Router();

router.use(.js"/users", userRoutes);
router.use("/sessions", sessionRoutes);
router.use("/register", authLimiter, registerRoutes);
router.use("/login", authLimiter, loginRoutes);
router.use("/game-scores", gameScoreRoutes);
router.use("/lobbies", lobbyRoutes);
router.use("/games", gameRoutes);
if (config.enableSwagger) {
  router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
export default router;
