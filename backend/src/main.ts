import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import express, { type RequestHandler } from "express";
import helmet, { type HelmetOptions } from "helmet";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { registerLobbySocketHandlers } from "./modules/lobby/lobby.socket.js";
import { seedDefaultUser } from "./shared/seedDefaultUser.js";
import sharedRoutes from "./shared/routes.js";
import { initLobbyRealtime } from "./modules/lobby/lobby.realtime.js";
import { initGameRealtime } from "./modules/game/game.realtime.js";
import { registerGameSocketHandlers } from "./modules/game/game.socket.js";
import { config } from "./shared/config.js";
import { apiLimiter } from "./shared/rateLimit.js";
const app = express();

if (config.seedDefaultUser) {
  await seedDefaultUser();
}

const corsOptions: CorsOptions = config.allowAnyOrigin
  ? { origin: true, credentials: true }
  : { origin: config.corsOrigins, credentials: true };

app.set("trust proxy", config.trustProxy);
app.disable("x-powered-by");
const helmetFactory =
  (helmet as unknown as { default?: (options?: HelmetOptions) => RequestHandler }).default ??
  (helmet as unknown as (options?: HelmetOptions) => RequestHandler);
app.use(helmetFactory({ contentSecurityPolicy: false }));
app.use(cookieParser(config.cookieSecret));
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(apiLimiter);

// Shared Routes
app.use("/", sharedRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Salut je suis démarré" });
});

if (!config.isProd) {
  app.get("/merde", (req, res) => {
    res.json({ message: "🚀 Backend Express + TS + Prisma est prêt !" });
  });
}

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: corsOptions,
});

// Initialise lobby real-time features
initLobbyRealtime(io);
registerLobbySocketHandlers(io, { cookieSecret: config.cookieSecret });

// Initialise game real-time features
initGameRealtime(io);
registerGameSocketHandlers(io);

const port = config.port;
const host = config.host;

httpServer.listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "localhost" : host;
  console.log(`✅ Backend running on http://${displayHost}:${port}`);
});
