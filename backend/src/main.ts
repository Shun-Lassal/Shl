import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { registerLobbySocketHandlers } from "./modules/lobby/lobby.socket.ts";
import { seedDefaultUser } from "./shared/seedDefaultUser.ts";
import sharedRoutes from "./shared/routes.ts";
import { initLobbyRealtime } from "./modules/lobby/lobby.realtime.ts";

seedDefaultUser();
const app = express();

const allowedOrigins = process.env.CORS_ORIGIN?.split(",") ?? [
  "http://localhost:5173",
];
const cookieSecret = process.env.COOKIE_SECRET ?? "Alleluia";

app.use(cookieParser(cookieSecret));
app.use(cors({ origin: allowedOrigins, credentials: true }));
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
  cors: { origin: allowedOrigins, credentials: true },
});

// Initialise lobby real-time features
initLobbyRealtime(io);
registerLobbySocketHandlers(io, { cookieSecret });

httpServer.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});
