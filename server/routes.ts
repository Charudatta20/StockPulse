import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertOrderSchema, insertWatchlistItemSchema, insertAlertSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Stock routes
  app.get('/api/stocks', async (req, res) => {
    try {
      const { search, limit } = req.query;
      let stocks;
      
      if (search) {
        stocks = await storage.searchStocks(search as string, parseInt(limit as string) || 20);
      } else {
        stocks = await storage.getStocks(parseInt(limit as string) || 50);
      }
      
      // Get current prices for all stocks
      const stockIds = stocks.map(s => s.id);
      const prices = await storage.getStockPrices(stockIds);
      const priceMap = new Map(prices.map(p => [p.stockId, p]));
      
      const stocksWithPrices = stocks.map(stock => ({
        ...stock,
        currentPrice: priceMap.get(stock.id),
      }));
      
      res.json(stocksWithPrices);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      res.status(500).json({ message: "Failed to fetch stocks" });
    }
  });

  app.get('/api/stocks/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const stock = await storage.getStock(symbol.toUpperCase());
      
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      const currentPrice = await storage.getStockPrice(stock.id);
      
      res.json({
        ...stock,
        currentPrice,
      });
    } catch (error) {
      console.error("Error fetching stock:", error);
      res.status(500).json({ message: "Failed to fetch stock" });
    }
  });

  // Portfolio routes
  app.get('/api/portfolios', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const portfolios = await storage.getUserPortfolios(userId);
      res.json(portfolios);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      res.status(500).json({ message: "Failed to fetch portfolios" });
    }
  });

  app.get('/api/portfolios/:id/holdings', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const holdings = await storage.getPortfolioHoldings(id);
      res.json(holdings);
    } catch (error) {
      console.error("Error fetching holdings:", error);
      res.status(500).json({ message: "Failed to fetch holdings" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId,
      });
      
      // Get user's default portfolio
      const portfolios = await storage.getUserPortfolios(userId);
      const defaultPortfolio = portfolios.find(p => p.isDefault) || portfolios[0];
      
      if (!defaultPortfolio) {
        return res.status(400).json({ message: "No portfolio found" });
      }
      
      orderData.portfolioId = defaultPortfolio.id;
      
      // Get stock to validate
      const stock = await storage.getStock(req.body.symbol);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      orderData.stockId = stock.id;
      
      // Calculate total value
      const price = parseFloat(orderData.price || '0');
      const quantity = orderData.quantity;
      orderData.totalValue = (price * quantity).toString();
      
      const order = await storage.createOrder(orderData);
      
      // For market orders, simulate immediate execution
      if (orderData.orderType === 'MARKET') {
        const currentPrice = await storage.getStockPrice(stock.id);
        const executionPrice = currentPrice ? parseFloat(currentPrice.price) : price;
        
        await storage.updateOrder(order.id, {
          status: 'FILLED',
          filledQuantity: quantity,
          filledPrice: executionPrice.toString(),
          totalValue: (executionPrice * quantity).toString(),
        });
        
        // Update holdings
        const existingHolding = await storage.getHolding(defaultPortfolio.id, stock.id);
        
        if (orderData.type === 'BUY') {
          if (existingHolding) {
            const newQuantity = existingHolding.quantity + quantity;
            const newTotalCost = parseFloat(existingHolding.totalCost) + (executionPrice * quantity);
            const newAverageCost = newTotalCost / newQuantity;
            
            await storage.updateHolding(existingHolding.id, {
              quantity: newQuantity,
              averageCost: newAverageCost.toString(),
              totalCost: newTotalCost.toString(),
            });
          } else {
            await storage.createHolding({
              portfolioId: defaultPortfolio.id,
              stockId: stock.id,
              quantity,
              averageCost: executionPrice.toString(),
              totalCost: (executionPrice * quantity).toString(),
            });
          }
        } else if (orderData.type === 'SELL' && existingHolding) {
          const newQuantity = existingHolding.quantity - quantity;
          if (newQuantity <= 0) {
            await storage.deleteHolding(existingHolding.id);
          } else {
            const newTotalCost = parseFloat(existingHolding.totalCost) - (parseFloat(existingHolding.averageCost) * quantity);
            await storage.updateHolding(existingHolding.id, {
              quantity: newQuantity,
              totalCost: newTotalCost.toString(),
            });
          }
        }
      }
      
      res.json(order);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const validationError = fromZodError(error as any);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Watchlist routes
  app.get('/api/watchlists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const watchlists = await storage.getUserWatchlists(userId);
      res.json(watchlists);
    } catch (error) {
      console.error("Error fetching watchlists:", error);
      res.status(500).json({ message: "Failed to fetch watchlists" });
    }
  });

  app.get('/api/watchlists/:id/items', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getWatchlistItems(id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching watchlist items:", error);
      res.status(500).json({ message: "Failed to fetch watchlist items" });
    }
  });

  app.post('/api/watchlists/:id/items', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { symbol } = req.body;
      
      const stock = await storage.getStock(symbol.toUpperCase());
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      const item = await storage.addToWatchlist(id, stock.id);
      res.json(item);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.delete('/api/watchlists/:watchlistId/items/:stockId', isAuthenticated, async (req: any, res) => {
    try {
      const { watchlistId, stockId } = req.params;
      await storage.removeFromWatchlist(watchlistId, stockId);
      res.json({ message: "Removed from watchlist" });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // IPO routes
  app.get('/api/ipos', async (req, res) => {
    try {
      const { status, country, limit } = req.query;
      const ipos = await storage.getIPOs(
        status as string,
        country as string,
        parseInt(limit as string) || 20
      );
      res.json(ipos);
    } catch (error) {
      console.error("Error fetching IPOs:", error);
      res.status(500).json({ message: "Failed to fetch IPOs" });
    }
  });

  // News routes
  app.get('/api/news', async (req, res) => {
    try {
      const { category, market, limit } = req.query;
      const newsItems = await storage.getNews(
        category as string,
        market as string,
        parseInt(limit as string) || 20
      );
      res.json(newsItems);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  // Currency routes
  app.get('/api/currency/:from/:to', async (req, res) => {
    try {
      const { from, to } = req.params;
      const rate = await storage.getCurrencyRate(from.toUpperCase(), to.toUpperCase());
      
      if (!rate) {
        return res.status(404).json({ message: "Currency rate not found" });
      }
      
      res.json(rate);
    } catch (error) {
      console.error("Error fetching currency rate:", error);
      res.status(500).json({ message: "Failed to fetch currency rate" });
    }
  });

  // Alert routes
  app.get('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alerts = await storage.getUserAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alertData = insertAlertSchema.parse({
        ...req.body,
        userId,
      });
      
      const alert = await storage.createAlert(alertData);
      res.json(alert);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const validationError = fromZodError(error as any);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating alert:", error);
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  // Market overview route
  app.get('/api/market/overview', async (req, res) => {
    try {
      // Get major market indices
      const indices = [
        { symbol: 'SPX', name: 'S&P 500', exchange: 'INDEX' },
        { symbol: 'IXIC', name: 'NASDAQ', exchange: 'INDEX' },
        { symbol: 'NIFTY', name: 'Nifty 50', exchange: 'NSE' },
        { symbol: 'SENSEX', name: 'Sensex', exchange: 'BSE' },
      ];
      
      const marketData = [];
      for (const index of indices) {
        const stock = await storage.getStock(index.symbol);
        if (stock) {
          const price = await storage.getStockPrice(stock.id);
          marketData.push({
            ...stock,
            currentPrice: price,
          });
        }
      }
      
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market overview:", error);
      res.status(500).json({ message: "Failed to fetch market overview" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'subscribe' && data.symbols) {
          // Subscribe to stock price updates
          ws.send(JSON.stringify({
            type: 'subscribed',
            symbols: data.symbols
          }));
          
          // Simulate price updates every 5 seconds
          const interval = setInterval(async () => {
            if (ws.readyState === WebSocket.OPEN) {
              try {
                for (const symbol of data.symbols) {
                  const stock = await storage.getStock(symbol);
                  if (stock) {
                    const currentPrice = await storage.getStockPrice(stock.id);
                    if (currentPrice) {
                      // Simulate small price changes
                      const basePrice = parseFloat(currentPrice.price);
                      const change = (Math.random() - 0.5) * basePrice * 0.02; // ±2% change
                      const newPrice = basePrice + change;
                      
                      await storage.updateStockPrice(
                        stock.id,
                        newPrice,
                        Math.floor(Math.random() * 1000000) + 100000 // Random volume
                      );
                      
                      const updatedPrice = await storage.getStockPrice(stock.id);
                      
                      ws.send(JSON.stringify({
                        type: 'price_update',
                        symbol: stock.symbol,
                        data: {
                          ...stock,
                          currentPrice: updatedPrice,
                        }
                      }));
                    }
                  }
                }
              } catch (error) {
                console.error('Error in WebSocket price update:', error);
              }
            } else {
              clearInterval(interval);
            }
          }, 5000);
          
          ws.on('close', () => {
            clearInterval(interval);
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
