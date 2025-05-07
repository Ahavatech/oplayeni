import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDB } from "./db";
import path from 'path';
import { fileURLToPath } from 'url'; // Add this import

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Define __dirname manually

const app = express();

app.use(
  cors({
    origin: ["http://localhost:4173", "https://ahavatech.github.io","https://oplayeni.github.io"], // replace with your actual GitHub Pages URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // 👈 VERY important if you're using cookies or auth headers
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
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

// Main function to start the server
async function start() {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then set up routes and start the server
    const server = await registerRoutes(app);

    // Serve static files from the 'dist' folder
     // Serve static files from 'dist' folder (this includes index.js)
     app.use(express.static(path.join(__dirname, 'dist')));

     // Serve static files from 'dist/public/assets' for assets
     app.use(express.static(path.join(__dirname, 'dist', 'public', 'assets')));
 
     // Serve the index.html from the public folder
     app.get('*', (req, res) => {
       res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
     });

    // Set up Vite middleware for development only
    if (process.env.NODE_ENV === 'development') {
      //await setupVite(app, server);
    }

    const port = process.env.PORT || 5000;
    
    server.listen(port, () => {
      console.log(`[express] serving on port ${port}`);
    });
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
  }
}

// Start the application
start().catch(console.error);

// Basic error-handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});