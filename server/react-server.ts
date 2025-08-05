import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { registerRoutes } from "./routes.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register API routes
registerRoutes(app).then(async () => {
  // Add a simple test route to verify server is working
  app.get("/api/test", (req, res) => {
    res.json({ 
      message: "Server is working!", 
      timestamp: new Date().toISOString(),
      status: "React server"
    });
  });

  // Try to build the React app
  console.log("Building React app...");
  try {
    await execAsync("npm run build");
    console.log("React app built successfully!");
  } catch (error) {
    console.error("Failed to build React app:", error);
  }

  // Serve the built React app
  const distPath = join(__dirname, "../dist/public");
  const reactIndexPath = join(distPath, "index.html");
  
  // Serve static files
  app.use(express.static(distPath));
  
  // Serve index.html for all routes (SPA routing)
  app.get("*", (req, res) => {
    res.sendFile(reactIndexPath, (err) => {
      if (err) {
        console.error('Error serving React app:', err);
        // Fallback to simple HTML
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>StockPulse</title>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 40px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                text-align: center; 
                min-height: 100vh;
              }
              .container { 
                max-width: 800px; 
                margin: 0 auto; 
              }
              h1 { 
                font-size: 3em; 
                margin-bottom: 20px; 
              }
              .content {
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 30px;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚀 StockPulse</h1>
              <p>React app is being built...</p>
              
              <div class="content">
                <h2>🔄 Building React App</h2>
                <p>Your React app is being built. Please refresh in a moment.</p>
                <p>If this persists, the React build may have failed.</p>
              </div>
            </div>
          </body>
          </html>
        `);
      }
    });
  });

  // Start server
  const port = parseInt(process.env.PORT || '5000', 10);
  app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 StockPulse React server running on port ${port}`);
    console.log(`📱 Visit: http://localhost:${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 