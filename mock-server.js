import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Mock user data
const mockUsers = [
  { id: 1, username: 'demo', email: 'demo@stockpulse.com', name: 'Demo User' }
];

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  // For demo purposes, always consider user as authenticated
  req.user = mockUsers[0];
  next();
};

// API Routes
app.get('/api/auth/user', mockAuth, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    name: req.user.name
  });
});

app.get('/api/login', (req, res) => {
  res.json({
    message: 'Login endpoint available',
    authUrl: '/auth/replit'
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Mock login - accept any credentials for demo
  if (username && password) {
    res.json({
      success: true,
      user: mockUsers[0],
      message: 'Login successful'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Username and password required'
    });
  }
});

app.get('/api/stocks', (req, res) => {
  // Mock stock data
  res.json([
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
  ]);
});

app.get('/api/portfolio', mockAuth, (req, res) => {
  res.json({
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
  });
});

app.get('/api/news', (req, res) => {
  res.json([
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
  ]);
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 StockPulse Mock Server running on http://localhost:${PORT}`);
  console.log('📊 Mock API endpoints available:');
  console.log('   - GET  /api/auth/user');
  console.log('   - GET  /api/login');
  console.log('   - POST /api/login');
  console.log('   - GET  /api/stocks');
  console.log('   - GET  /api/portfolio');
  console.log('   - GET  /api/news');
}); 