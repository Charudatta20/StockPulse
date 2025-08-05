import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { registerRoutes } from "./routes.js";
import { existsSync } from "fs";

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
      status: "Simple React server"
    });
  });

  // Check if React app exists
  const distPath = join(__dirname, "../dist/public");
  const reactIndexPath = join(distPath, "index.html");
  const reactAppExists = existsSync(reactIndexPath);
  
  console.log("React app exists:", reactAppExists);
  console.log("React app path:", reactIndexPath);
  
  if (reactAppExists) {
    // Serve static files
    app.use(express.static(distPath));
    
    // Serve index.html for all routes (SPA routing)
    app.get("*", (req, res) => {
      res.sendFile(reactIndexPath, (err) => {
        if (err) {
          console.error('Error serving React app:', err);
          serveFallback(res);
        }
      });
    });
    console.log("Serving React app from:", distPath);
  } else {
    // React app doesn't exist, serve fallback
    console.log("React app not found, serving fallback");
    app.get("*", (req, res) => {
      serveFallback(res);
    });
  }

  function serveFallback(res) {
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
          .nav {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 30px 0;
            flex-wrap: wrap;
          }
          .nav button {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
          }
          .content {
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            margin-top: 30px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }
          .card {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 StockPulse</h1>
          <p>Your Professional Trading Platform</p>
          
          <div class="nav">
            <button onclick="showSection('dashboard')">Dashboard</button>
            <button onclick="showSection('portfolio')">Portfolio</button>
            <button onclick="showSection('markets')">Markets</button>
            <button onclick="showSection('watchlist')">Watchlist</button>
            <button onclick="showSection('news')">News</button>
          </div>
          
          <div class="content">
            <h2>📊 Dashboard</h2>
            <p>Welcome to StockPulse! Your trading platform is ready.</p>
            <div class="grid">
              <div class="card">
                <h3>📈 Market Overview</h3>
                <p>AAPL: $150.25 +2.3%</p>
                <p>GOOGL: $2,850.10 +1.8%</p>
                <p>MSFT: $320.45 -0.5%</p>
              </div>
              <div class="card">
                <h3>💰 Portfolio Value</h3>
                <p style="font-size: 2em;">$125,430.50</p>
                <p style="color: #4ade80;">+$2,450.30 (+2.0%)</p>
              </div>
              <div class="card">
                <h3>📰 Latest News</h3>
                <p>Tech Stocks Rally</p>
                <p>Fed Rate Decision</p>
                <p>Earnings Season</p>
              </div>
            </div>
          </div>
        </div>
        
        <script>
          function showSection(section) {
            alert('Section: ' + section + ' - Full React functionality coming soon!');
          }
        </script>
      </body>
      </html>
    `);
  }

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