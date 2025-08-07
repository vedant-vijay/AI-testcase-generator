import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import githubRoutes from "./routes/github";
import aiRoutes from "./routes/ai";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.APP_URL || "http://localhost:8080",
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // GitHub API routes
  app.use("/api/github", githubRoutes);

  // AI routes
  app.use("/api/ai", aiRoutes);

  return app;
}
