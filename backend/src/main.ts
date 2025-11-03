import express from "express"
import { prisma } from "./shared/prisma"
import cors from "cors"
import sharedRoutes from "./shared/routes"
import { seedDefaultUser } from "./shared/seedDefaultUser"

seedDefaultUser();
const app = express()

const allowedOrigins = process.env.CORS_ORIGIN?.split(",") ?? [
  "http://localhost:5173",
]

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

// Shared Routes
app.use('/', sharedRoutes);


app.get("/merde", (req, res) => {
  res.json({ message: "🚀 Backend Express + TS + Prisma est prêt !" })
})

app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000")
})
