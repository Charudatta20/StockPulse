const express = require('express');
const path = require('path');

const app = express();

// Simple test route
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Server is working!", 
    timestamp: new Date().toISOString(),
    status: "Test server"
  });
});

// Serve HTML for all routes
app.get("*", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>StockPulse Test</title>
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
        <p>Test Server - Working!</p>
        
        <div class="content">
          <h2>✅ Server is Running</h2>
          <p>If you can see this, the server is working correctly!</p>
          <p>This means your StockPulse will deploy successfully.</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

const port = 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Test server running on port ${port}`);
  console.log(`📱 Visit: http://localhost:${port}`);
}); 