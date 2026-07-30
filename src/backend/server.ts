import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- BACKEND API ROUTES ---
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "Personal Electrician Management Backend",
      developerNote: "All Backend API routes and services live in the /src/backend directory."
    });
  });

  // --- VITE INTERFACE / FRONTEND INTEGRATION ---
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting backend in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite middleware to serve client SPA files dynamically
    app.use(vite.middlewares);
  } else {
    console.log("Starting backend in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve production built assets
    app.use(express.static(distPath));
    
    // Fallback for client-side routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===================================================`);
    console.log(`  SERVER INITIALIZED SUCCESSFULLY`);
    console.log(`  Local Address:  http://localhost:${PORT}`);
    console.log(`  Host Binding:   0.0.0.0`);
    console.log(`===================================================`);
  });
}

startServer().catch((error) => {
  console.error("Critical error during server initialization:", error);
  process.exit(1);
});
