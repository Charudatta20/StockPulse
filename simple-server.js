import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5000;

// Mock user data
const mockUsers = [
  { id: 1, username: 'demo', email: 'demo@stockpulse.com', name: 'Demo User' }
];

// Mock stock data
const mockStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 150.25,
    change: 2.15,
    changePercent: 1.45,
    marketCap: '2.5T',
    volume: '45.2M'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 2750.80,
    change: -15.20,
    changePercent: -0.55,
    marketCap: '1.8T',
    volume: '12.8M'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 320.45,
    change: 8.75,
    changePercent: 2.81,
    marketCap: '2.4T',
    volume: '28.9M'
  }
];

// Mock portfolio data
const mockPortfolio = {
  totalValue: 125000,
  totalGain: 8500,
  totalGainPercent: 7.3,
  holdings: [
    {
      symbol: 'AAPL',
      shares: 10,
      avgPrice: 145.00,
      currentPrice: 150.25,
      totalValue: 1502.50,
      gain: 52.50,
      gainPercent: 3.62
    }
  ]
};

// Mock news data
const mockNews = [
  {
    id: 1,
    title: 'Tech Stocks Rally on Strong Earnings',
    summary: 'Major technology companies report better-than-expected quarterly results.',
    source: 'Financial Times',
    publishedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Federal Reserve Announces Interest Rate Decision',
    summary: 'Central bank maintains current rates amid economic uncertainty.',
    source: 'Reuters',
    publishedAt: new Date().toISOString()
  }
];

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // API Routes
  if (pathname === '/api/auth/user') {
    res.writeHead(200);
    res.end(JSON.stringify({
      id: mockUsers[0].id,
      username: mockUsers[0].username,
      email: mockUsers[0].email,
      name: mockUsers[0].name
    }));
    return;
  }

  if (pathname === '/api/login') {
    if (req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'Login endpoint available',
        authUrl: '/auth/replit'
      }));
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const { username, password } = JSON.parse(body);
          if (username && password) {
            res.writeHead(200);
            res.end(JSON.stringify({
              success: true,
              user: mockUsers[0],
              message: 'Login successful'
            }));
          } else {
            res.writeHead(400);
            res.end(JSON.stringify({
              success: false,
              message: 'Username and password required'
            }));
          }
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid JSON'
          }));
        }
      });
    }
    return;
  }

  if (pathname === '/api/stocks') {
    res.writeHead(200);
    res.end(JSON.stringify(mockStocks));
    return;
  }

  if (pathname === '/api/portfolio') {
    res.writeHead(200);
    res.end(JSON.stringify(mockPortfolio));
    return;
  }

  if (pathname === '/api/news') {
    res.writeHead(200);
    res.end(JSON.stringify(mockNews));
    return;
  }

  // Serve static files
  let filePath = pathname;
  if (pathname === '/') {
    filePath = '/index.html';
  }

  const fullPath = path.join(__dirname, 'dist', 'public', filePath);

  // Check if file exists
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    }[ext] || 'text/plain';

    res.setHeader('Content-Type', contentType);
    res.writeHead(200);
    fs.createReadStream(fullPath).pipe(res);
  } else {
    // Serve index.html for all other routes (SPA routing)
    const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`🚀 StockPulse Mock Server running on http://localhost:${PORT}`);
  console.log('📊 Mock API endpoints available:');
  console.log('   - GET  /api/auth/user');
  console.log('   - GET  /api/login');
  console.log('   - POST /api/login');
  console.log('   - GET  /api/stocks');
  console.log('   - GET  /api/portfolio');
  console.log('   - GET  /api/news');
}); 