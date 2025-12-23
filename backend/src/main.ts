import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { registerLobbySocketHandlers } from "./modules/lobby/lobby.socket.ts";
import { seedDefaultUser } from "./shared/seedDefaultUser.ts";
import sharedRoutes from "./shared/routes.ts";
import { initLobbyRealtime } from "./modules/lobby/lobby.realtime.ts";
import { initGameRealtime } from "./modules/game/game.realtime.ts";
import { registerGameSocketHandlers } from "./modules/game/game.socket.ts";

seedDefaultUser();
const app = express();

const parseOrigins = (value?: string): string[] =>
  (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

const explicitOrigins = parseOrigins(process.env.CORS_ORIGIN);
const defaultOrigins = ["http://localhost:5173"];
const allowAnyOrigin =
  explicitOrigins.length === 0 && process.env.NODE_ENV !== "production";

const corsOptions: CorsOptions = allowAnyOrigin
  ? { origin: true, credentials: true }
  : { origin: explicitOrigins.length ? explicitOrigins : defaultOrigins, credentials: true };
const cookieSecret = process.env.COOKIE_SECRET ?? "Alleluia";

app.use(cookieParser(cookieSecret));
app.use(cors(corsOptions));
app.use(express.json());

// Shared Routes
app.use("/", sharedRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Salut je suis démarré" });
});

app.get("/merde", (req, res) => {
  res.json({ message: "🚀 Backend Express + TS + Prisma est prêt !" });
});

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: corsOptions,
});

// Initialise lobby real-time features
initLobbyRealtime(io);
registerLobbySocketHandlers(io, { cookieSecret });

// Initialise game real-time features
initGameRealtime(io);
registerGameSocketHandlers(io);

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

httpServer.listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "localhost" : host;
  console.log(`✅ Backend running on http://${displayHost}:${port}`);
});
