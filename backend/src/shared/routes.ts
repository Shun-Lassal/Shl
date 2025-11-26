import { Router } from "express";
import userRoutes from "../modules/user/user.routes.js";
import sessionRoutes from "../modules/session/session.routes.js";
import registerRoutes from "../modules/register_todo/register.routes.js";
import loginRoutes from "../modules/login_todo/login.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/sessions", sessionRoutes);
router.use("/register", registerRoutes);
router.use("/login", loginRoutes);
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
export default router;