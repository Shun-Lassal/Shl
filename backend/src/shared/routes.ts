import express from "express";
import userRoutes from "../modules/user/user.routes.ts";
import sessionRoutes from "../modules/session/session.routes.ts";
import registerRoutes from "../modules/register/register.routes.ts";
import loginRoutes from "../modules/login/login.routes.ts";
import gameScoreRoutes from "../modules/gameScore/gameScore.routes.ts";
import lobbyRoutes from "../modules/lobby/lobby.routes.ts";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.ts";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/sessions", sessionRoutes);
router.use("/register", registerRoutes);
router.use("/login", loginRoutes);
router.use("/game-scores", gameScoreRoutes);
router.use("/lobbies", lobbyRoutes);
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
export default router;
