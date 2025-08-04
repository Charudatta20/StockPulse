import express, { type Request, Response, NextFunction } from "express";
import { log } from "./vite";

const app = express();
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

// Simple working server
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>StockPulse</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 800px; margin: 0 auto; text-align: center; }
        h1 { font-size: 3em; margin-bottom: 20px; }
        .btn { display: inline-block; padding: 12px 24px; margin: 10px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        .btn:hover { background: #45a049; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 StockPulse</h1>
        <p>Your trading platform is working!</p>
        <div>
          <a href="/signup" class="btn">Create Account</a>
          <a href="/login" class="btn">Sign In</a>
        </div>
        <p><small>Server is running successfully</small></p>
      </div>
    </body>
    </html>
  `);
});

app.get("/test", (req, res) => {
  res.json({ message: "Server is working!", timestamp: new Date().toISOString() });
});

app.get("/signup", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sign Up - StockPulse</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 400px; margin: 0 auto; text-align: center; }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        .form { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 10px; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: none; border-radius: 5px; }
        .btn { width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .btn:hover { background: #45a049; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Create Account</h1>
        <div class="form">
          <form>
            <input type="text" placeholder="First Name" required>
            <input type="text" placeholder="Last Name" required>
            <input type="email" placeholder="Email" required>
            <input type="password" placeholder="Password" required>
            <button type="submit" class="btn">Create Account</button>
          </form>
          <p><a href="/login" style="color: white;">Already have an account? Sign in</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get("/login", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sign In - StockPulse</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 400px; margin: 0 auto; text-align: center; }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        .form { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 10px; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: none; border-radius: 5px; }
        .btn { width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .btn:hover { background: #45a049; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome Back</h1>
        <div class="form">
          <form>
            <input type="email" placeholder="Email" required>
            <input type="password" placeholder="Password" required>
            <button type="submit" class="btn">Sign In</button>
          </form>
          <p><a href="/signup" style="color: white;">Don't have an account? Sign up</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

const port = parseInt(process.env.PORT || '5000', 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 StockPulse server running on port ${port}`);
  console.log(`📱 Visit: http://localhost:${port}`);
});
