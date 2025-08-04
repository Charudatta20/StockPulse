import express from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
          <form action="/dashboard" method="GET">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit" class="btn">Sign In</button>
          </form>
          <p><a href="/signup" style="color: white;">Don't have an account? Sign up</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get("/dashboard", (req, res) => {
  const email = req.query.email || 'User';
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dashboard - StockPulse</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .header { background: rgba(0,0,0,0.2); padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .welcome { text-align: center; margin: 40px 0; }
        h1 { font-size: 3em; margin-bottom: 10px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 40px 0; }
        .card { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 10px; text-align: center; }
        .card h3 { margin: 0 0 15px 0; font-size: 1.5em; }
        .card p { font-size: 2em; font-weight: bold; margin: 0; }
        .nav { display: flex; gap: 20px; }
        .nav a { color: white; text-decoration: none; padding: 10px 20px; background: rgba(255,255,255,0.1); border-radius: 5px; }
        .nav a:hover { background: rgba(255,255,255,0.2); }
        .logout { background: #ff4757 !important; }
        .logout:hover { background: #ff3742 !important; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>StockPulse</h2>
        <div class="nav">
          <a href="/portfolio">Portfolio</a>
          <a href="/markets">Markets</a>
          <a href="/watchlist">Watchlist</a>
          <a href="/" class="logout">Logout</a>
        </div>
      </div>
      <div class="container">
        <div class="welcome">
          <h1>Welcome back, ${email}!</h1>
          <p>Your trading dashboard is ready</p>
        </div>
        <div class="stats">
          <div class="card">
            <h3>Portfolio Value</h3>
            <p>$10,000</p>
          </div>
          <div class="card">
            <h3>Today's Gain</h3>
            <p style="color: #4CAF50;">+$250</p>
          </div>
          <div class="card">
            <h3>Total Gain</h3>
            <p style="color: #4CAF50;">+$1,200</p>
          </div>
          <div class="card">
            <h3>Active Positions</h3>
            <p>5</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get("/portfolio", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Portfolio - StockPulse</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .header { background: rgba(0,0,0,0.2); padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .nav { display: flex; gap: 20px; }
        .nav a { color: white; text-decoration: none; padding: 10px 20px; background: rgba(255,255,255,0.1); border-radius: 5px; }
        .nav a:hover { background: rgba(255,255,255,0.2); }
        .logout { background: #ff4757 !important; }
        .logout:hover { background: #ff3742 !important; }
        h1 { font-size: 3em; margin-bottom: 20px; text-align: center; }
        .coming-soon { text-align: center; font-size: 1.5em; margin: 40px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>StockPulse</h2>
        <div class="nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/portfolio">Portfolio</a>
          <a href="/markets">Markets</a>
          <a href="/watchlist">Watchlist</a>
          <a href="/" class="logout">Logout</a>
        </div>
      </div>
      <div class="container">
        <h1>Portfolio</h1>
        <div class="coming-soon">
          <p>🚀 Portfolio management coming soon!</p>
          <p>Track your investments, analyze performance, and optimize your portfolio.</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get("/markets", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Markets - StockPulse</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .header { background: rgba(0,0,0,0.2); padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .nav { display: flex; gap: 20px; }
        .nav a { color: white; text-decoration: none; padding: 10px 20px; background: rgba(255,255,255,0.1); border-radius: 5px; }
        .nav a:hover { background: rgba(255,255,255,0.2); }
        .logout { background: #ff4757 !important; }
        .logout:hover { background: #ff3742 !important; }
        h1 { font-size: 3em; margin-bottom: 20px; text-align: center; }
        .coming-soon { text-align: center; font-size: 1.5em; margin: 40px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>StockPulse</h2>
        <div class="nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/portfolio">Portfolio</a>
          <a href="/markets">Markets</a>
          <a href="/watchlist">Watchlist</a>
          <a href="/" class="logout">Logout</a>
        </div>
      </div>
      <div class="container">
        <h1>Markets</h1>
        <div class="coming-soon">
          <p>📈 Real-time market data coming soon!</p>
          <p>Access both US and Indian stock markets with live price updates.</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get("/watchlist", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Watchlist - StockPulse</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .header { background: rgba(0,0,0,0.2); padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .nav { display: flex; gap: 20px; }
        .nav a { color: white; text-decoration: none; padding: 10px 20px; background: rgba(255,255,255,0.1); border-radius: 5px; }
        .nav a:hover { background: rgba(255,255,255,0.2); }
        .logout { background: #ff4757 !important; }
        .logout:hover { background: #ff3742 !important; }
        h1 { font-size: 3em; margin-bottom: 20px; text-align: center; }
        .coming-soon { text-align: center; font-size: 1.5em; margin: 40px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>StockPulse</h2>
        <div class="nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/portfolio">Portfolio</a>
          <a href="/markets">Markets</a>
          <a href="/watchlist">Watchlist</a>
          <a href="/" class="logout">Logout</a>
        </div>
      </div>
      <div class="container">
        <h1>Watchlist</h1>
        <div class="coming-soon">
          <p>👀 Watchlist management coming soon!</p>
          <p>Track your favorite stocks and get alerts on price movements.</p>
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
