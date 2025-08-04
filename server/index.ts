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
  // Serve the built React app
  const distPath = join(__dirname, "../dist/public");
  
  // Serve static files
  app.use(express.static(distPath));
  
  // Serve index.html for all routes (SPA routing)
  app.get("*", async (req, res) => {
    res.sendFile(join(distPath, "index.html"), async (err) => {
      if (err) {
        console.error('Error serving React app:', err);
        console.log('Attempting to build React app...');
        
        // Try to build the React app if it doesn't exist
        const { exec } = await import('child_process');
        exec('npm run build', (buildErr) => {
          if (buildErr) {
            console.error('Build failed:', buildErr);
            // Fallback: serve a simple loading page
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
                  <div class="loading">Building your trading platform...</div>
                  <div class="error">
                    <p>The React app is being built. Please refresh in a moment.</p>
                    <p>If this persists, check the build logs.</p>
                  </div>
                </div>
              </body>
              </html>
            `);
          } else {
            // Try to serve the built app again
            res.sendFile(join(distPath, "index.html"), (retryErr) => {
              if (retryErr) {
                console.error('Still cannot serve React app after build:', retryErr);
                res.status(500).send('Failed to build React app');
              }
            });
          }
        });
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
