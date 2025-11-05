import express from "express"
import { prisma } from "./shared/prisma"
import cors from "cors"
import sharedRoutes from "./shared/routes"
import { seedDefaultUser } from "./shared/seedDefaultUser"
import cookieParser from "cookie-parser"
seedDefaultUser();
const app = express()

const allowedOrigins = process.env.CORS_ORIGIN?.split(",") ?? [
  "http://localhost:5173",
]
const cookieSecret = process.env.COOKIE_SECRET ?? "Alleluia"
app.use(cookieParser(cookieSecret))
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

// Shared Routes
app.use('/', sharedRoutes);

app.get("/", (req, res) => {
  res.status(200).json({message:"Salut je suis démarré"})
})

app.get("/merde", (req, res) => {
  res.json({ message: "🚀 Backend Express + TS + Prisma est prêt !" })
})

app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000")
})
