import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
import oauthRoutes from "./routes/oauth";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";

// Routes
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import taskRoutes from "./routes/taskRoutes";
import commentRoutes from "./routes/commentRoutes";
import { searchUsers, getAllUsers } from "./controllers/projectController";

// Middleware
import { authenticateToken } from "./middleware/auth";

export function createApp() {
  const app = express();

  // Cookies
  app.use(cookieParser());
  app.use(passport.initialize());

  // Sécurité
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.FRONTEND_URL
          : "http://localhost:3000",
      credentials: true,
    })
  );

  // Logs
  app.use(morgan("combined"));

  // Body parser
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Swagger
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "API Gestionnaire de Projets - Documentation",
    })
  );

  // Routes API
  app.use("/auth", authRoutes);
  app.use("/projects", projectRoutes);
  app.use("/dashboard", dashboardRoutes);
  app.use("/tasks", taskRoutes);
  app.use("/comments", commentRoutes);

  // OAuth GitHub
  app.use(oauthRoutes);

  // Users
  app.get("/users/search", authenticateToken as any, searchUsers);
  app.get("/users", authenticateToken as any, getAllUsers);

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "API en ligne",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  // Route racine
  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "API REST avec authentification et gestion de projets",
      version: "1.0.0",
    });
  });

  // 404 — compatible Express 5 (pas de wildcard)
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route non trouvée",
      error: "NOT_FOUND",
    });
  });

  return app;
}
