import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { registerRoutes } from "./routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register API routes
registerRoutes(app).then(() => {
  // Add a simple test route to verify server is working
  app.get("/api/test", (req, res) => {
    res.json({ 
      message: "Server is working!", 
      timestamp: new Date().toISOString(),
      status: "Serving HTML fallback"
    });
  });

  // Serve the fallback HTML for all routes
  app.get("*", (req, res) => {
    const fallbackPath = join(__dirname, "simple-fallback.html");
    res.sendFile(fallbackPath, (err) => {
      if (err) {
        console.error('Error serving fallback:', err);
        // Final fallback: simple message
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>StockPulse</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; }
              .container { max-width: 600px; margin: 0 auto; }
              h1 { font-size: 3em; margin-bottom: 20px; }
              .loading { font-size: 1.5em; margin: 20px 0; }
              .error { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚀 StockPulse</h1>
              <div class="loading">Your Trading Platform</div>
              <div class="error">
                <p>Welcome to StockPulse!</p>
                <p>Your trading platform is ready.</p>
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
    console.log(`🚀 StockPulse server running on port ${port}`);
    console.log(`📱 Visit: http://localhost:${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 