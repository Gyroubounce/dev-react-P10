console.log("BOOT OK");

try {
  require("dotenv/config");
  console.log("[ENV] dotenv chargé");
} catch (e) {
  console.error("[ENV] dotenv non chargé", e);
}

console.log("[ENV] NODE_ENV =", process.env.NODE_ENV);
console.log("[ENV] PORT =", process.env.PORT);
console.log("[ENV] DATABASE_URL =", process.env.DATABASE_URL ? "SET" : "MISSING");

import express from "express";
import { PrismaClient } from "@prisma/client";
import { createApp as createApiApp } from "./app";
import next from "next";
import path from "path";

const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== "production";

/**
 * ✅ IMPORTANT : on pointe vers le dossier frontend
 */
const nextApp = next({
  dev,
  dir: path.join(__dirname, "../../frontend"),
});

const handle = nextApp.getRequestHandler();

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[FATAL] uncaughtException:", err);
  process.exit(1);
});

async function startServer() {
  console.log("[START] Début startServer()");

  try {
    console.log("[PRISMA] Tentative de connexion...");
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Prisma connect timeout (10s)")), 10000)
      ),
    ]);
    console.log("[PRISMA] ✅ Connecté");

    console.log("[NEXT] Préparation Next.js...");
    await nextApp.prepare(); // ⚠ nécessite .next (donc next build fait)

    const app = express();

    /**
     * ✅ API en priorité
     */
    const apiApp = createApiApp();
    app.use(apiApp);

    /**
     * ✅ Laisser Next gérer le reste (pages)
     * MAIS on évite d'intercepter les routes API
     */
    app.all("*", (req, res) => {
      if (
        req.path.startsWith("/auth") ||
        req.path.startsWith("/projects") ||
        req.path.startsWith("/dashboard") ||
        req.path.startsWith("/users") ||
        req.path.startsWith("/api-docs") ||
        req.path.startsWith("/health")
      ) {
        return res.status(404).json({
          success: false,
          message: "Route API non trouvée",
        });
      }

      return handle(req, res);
    });

    console.log("[HTTP] Démarrage serveur...");
    app.listen(PORT, HOST, () => {
      console.log(
        `[HTTP] ✅ Serveur + Next.js SSR écoute sur http://${HOST}:${PORT}`
      );
    });
  } catch (error) {
    console.error("[START] ❌ Erreur au démarrage:", error);
    try {
      console.log("[PRISMA] Disconnect (cleanup)...");
      await prisma.$disconnect();
      console.log("[PRISMA] ✅ Disconnected");
    } catch (e) {
      console.error("[PRISMA] ❌ Erreur disconnect:", e);
    }
    process.exit(1);
  }
}

startServer();