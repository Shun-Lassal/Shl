import { Router } from "express";
import userRoutes from "../modules/user/user.routes";
import sessionRoutes from "../modules/session/session.routes";
import registerRoutes from "../modules/register_todo/register.routes";
import loginRoutes from "../modules/login_todo/login.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

const router = Router();

router.use("/users", userRoutes);
router.use("/sessions", sessionRoutes);
router.use("/register", registerRoutes);
router.use("/login", loginRoutes);
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
export default router;