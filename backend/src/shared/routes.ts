import express from "express";
import userRoutes from "../modules/user/user.routes.js";
import sessionRoutes from "../modules/session/session.routes.js";
import registerRoutes from "../modules/register/register.routes.js";
import loginRoutes from "../modules/login/login.routes.js";
import gameScoreRoutes from "../modules/gameScore/gameScore.routes.js";
import lobbyRoutes from "../modules/lobby/lobby.routes.js";
import gameRoutes from "../modules/game/game.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";
import { authLimiter } from "./rateLimit.js";
import { config } from "./config.js";

const router = express.Router();

router.use("/users", userRoutes);
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
