import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDB } from "./db";
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(
  cors({
    origin: "*", // Change this to your frontend domain for security (e.g., "http://yourfrontend.com")
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function start() {
  try {
    await connectDB();
    const server = await registerRoutes(app);

    const port = process.env.PORT || 5001;

    // Only use Vite dev server in development
    if (process.env.NODE_ENV !== 'production') {
      await setupVite(app, server);
    } else {
      // Serve Vite build in production
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

     
const staticPath = path.join(process.cwd(), 'server', 'dist', 'public');

app.use(express.static(staticPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});
    }

    server.listen(port, () => {
      console.log(`[express] serving on port ${port}`);
    });
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
  }
}


start().catch(console.error);
