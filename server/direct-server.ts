import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple test route
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Server is working!", 
    timestamp: new Date().toISOString(),
    status: "Direct HTML server"
  });
});

// Serve the HTML fallback for ALL routes
app.get("*", (req, res) => {
  const fallbackPath = join(__dirname, "simple-fallback.html");
  res.sendFile(fallbackPath, (err) => {
    if (err) {
      console.error('Error serving fallback:', err);
      // If file doesn't exist, serve inline HTML
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
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
                  <h3>📈 Market Overview</h3>
                  <p>AAPL: $150.25 +2.3%</p>
                  <p>GOOGL: $2,850.10 +1.8%</p>
                  <p>MSFT: $320.45 -0.5%</p>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
                  <h3>💰 Portfolio Value</h3>
                  <p style="font-size: 2em;">$125,430.50</p>
                  <p style="color: #4ade80;">+$2,450.30 (+2.0%)</p>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
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
              alert('Section: ' + section + ' - Full functionality coming soon!');
            }
          </script>
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