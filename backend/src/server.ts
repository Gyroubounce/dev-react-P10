import { PrismaClient } from "@prisma/client";
import { createApp } from "./app";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const PORT = Number(process.env.PORT) || 8000;
const HOST = "0.0.0.0";

async function startServer() {
  try {
    await prisma.$connect();

    const app = createApp();

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Serveur API en ligne sur http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erreur au démarrage :", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
