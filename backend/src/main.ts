import express from "express"
import { PrismaClient } from "@prisma/client"
import cors from "cors"

const app = express()
const prisma = new PrismaClient()

const allowedOrigins = process.env.CORS_ORIGIN?.split(",") ?? [
  "http://localhost:5173",
]
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ message: "🚀 Backend Express + TS + Prisma est prêt !" })
})

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})

app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000")
})
