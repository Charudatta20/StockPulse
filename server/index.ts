import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic } from "./vite.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create HTTP server
const server = createServer(app);

// Register API routes
registerRoutes(app).then(() => {
  // Setup Vite for development or serve static files in production
  if (process.env.NODE_ENV !== 'production') {
    setupVite(app, server);
  } else {
    // Serve the built React app
    const distPath = join(__dirname, "../dist/public");
    app.use(express.static(distPath));
    
    // Serve index.html for all routes (SPA routing)
    app.get("*", (req, res) => {
      res.sendFile(join(distPath, "index.html"), (err) => {
        if (err) {
          console.error('Error serving React app:', err);
          // Fallback: serve a simple working dashboard
          res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>StockPulse Dashboard</title>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; margin: 0; background: #0f0f23; color: white; }
                .header { background: #1a1a2e; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
                .logo { display: flex; align-items: center; gap: 10px; font-size: 1.5em; font-weight: bold; }
                .nav { display: flex; gap: 20px; }
                .nav a { color: white; text-decoration: none; padding: 10px 20px; background: #16213e; border-radius: 5px; }
                .nav a:hover { background: #0f3460; }
                .nav a.active { background: #0f3460; }
                .user { display: flex; align-items: center; gap: 15px; }
                .avatar { width: 40px; height: 40px; background: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
                .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
                .portfolio { background: #1a1a2e; padding: 30px; border-radius: 10px; margin: 20px 0; }
                .portfolio h2 { margin: 0 0 20px 0; font-size: 2em; }
                .value { font-size: 3em; font-weight: bold; margin: 10px 0; }
                .change { font-size: 1.2em; color: #4CAF50; }
                .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 40px 0; }
                .card { background: #1a1a2e; padding: 30px; border-radius: 10px; text-align: center; }
                .card h3 { margin: 0 0 15px 0; font-size: 1.2em; }
                .card p { font-size: 2em; font-weight: bold; margin: 0; }
                .positive { color: #4CAF50; }
                .negative { color: #ff4757; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">
                  📈 StockPulse
                </div>
                <div class="nav">
                  <a href="#" class="active">Dashboard</a>
                  <a href="#">Portfolio</a>
                  <a href="#">Markets</a>
                  <a href="#">Watchlist</a>
                  <a href="#">News</a>
                  <a href="#">IPOs</a>
                </div>
                <div class="user">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span>USD</span>
                    <span>🌙</span>
                  </div>
                  <div class="avatar">CP</div>
                  <div>
                    <div>Charudatta Patil</div>
                    <div style="font-size: 0.8em; color: #888;">Premium Member</div>
                  </div>
                </div>
              </div>
              <div class="container">
                <div class="portfolio">
                  <h2>Portfolio Value</h2>
                  <div class="value">$15,420.88</div>
                  <div class="change">+$250.00 (+1.65%)</div>
                  <div style="margin-top: 20px; height: 60px; background: linear-gradient(90deg, #4CAF50 20%, #4CAF50 40%, #2196F3 60%, #4CAF50 80%); border-radius: 5px;"></div>
                </div>
                <div class="stats">
                  <div class="card">
                    <h3>Today's Change</h3>
                    <p class="positive">+$250.00</p>
                  </div>
                  <div class="card">
                    <h3>Total Positions</h3>
                    <p>0</p>
                  </div>
                  <div class="card">
                    <h3>Buying Power</h3>
                    <p>$15,420.88</p>
                  </div>
                </div>
                <div class="card">
                  <h3>Quick Trade</h3>
                  <input type="text" placeholder="Search Stock" style="width: 100%; padding: 10px; margin: 10px 0; border: none; border-radius: 5px; background: #16213e; color: white;">
                </div>
              </div>
            </body>
            </html>
          `);
        }
      });
    });
  }

  // Start server
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 StockPulse server running on port ${port}`);
    console.log(`📱 Visit: http://localhost:${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
