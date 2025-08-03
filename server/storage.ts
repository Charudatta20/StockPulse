import {
  users,
  stocks,
  portfolios,
  holdings,
  orders,
  watchlists,
  watchlistItems,
  ipos,
  news,
  stockPrices,
  currencyRates,
  alerts,
  type User,
  type UpsertUser,
  type Stock,
  type InsertStock,
  type StockPrice,
  type Portfolio,
  type InsertPortfolio,
  type Holding,
  type InsertHolding,
  type Order,
  type InsertOrder,
  type Watchlist,
  type InsertWatchlist,
  type WatchlistItem,
  type InsertWatchlistItem,
  type IPO,
  type InsertIPO,
  type News,
  type InsertNews,
  type CurrencyRate,
  type InsertCurrencyRate,
  type Alert,
  type InsertAlert,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Stock operations
  getStock(symbol: string): Promise<Stock | undefined>;
  getStocks(limit?: number): Promise<Stock[]>;
  searchStocks(query: string, limit?: number): Promise<Stock[]>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStockPrice(stockId: string, price: number, volume?: number): Promise<void>;
  getStockPrice(stockId: string): Promise<StockPrice | undefined>;
  getStockPrices(stockIds: string[]): Promise<StockPrice[]>;
  
  // Portfolio operations
  getUserPortfolios(userId: string): Promise<Portfolio[]>;
  getPortfolio(id: string): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: string, updates: Partial<Portfolio>): Promise<Portfolio>;
  
  // Holdings operations
  getPortfolioHoldings(portfolioId: string): Promise<(Holding & { stock: Stock; currentPrice?: StockPrice })[]>;
  getHolding(portfolioId: string, stockId: string): Promise<Holding | undefined>;
  createHolding(holding: InsertHolding): Promise<Holding>;
  updateHolding(id: string, updates: Partial<Holding>): Promise<Holding>;
  deleteHolding(id: string): Promise<void>;
  
  // Order operations
  getUserOrders(userId: string, limit?: number): Promise<(Order & { stock: Stock })[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order>;
  
  // Watchlist operations
  getUserWatchlists(userId: string): Promise<Watchlist[]>;
  getWatchlistItems(watchlistId: string): Promise<(WatchlistItem & { stock: Stock; currentPrice?: StockPrice })[]>;
  createWatchlist(watchlist: InsertWatchlist): Promise<Watchlist>;
  addToWatchlist(watchlistId: string, stockId: string): Promise<WatchlistItem>;
  removeFromWatchlist(watchlistId: string, stockId: string): Promise<void>;
  
  // IPO operations
  getIPOs(status?: string, country?: string, limit?: number): Promise<IPO[]>;
  createIPO(ipo: InsertIPO): Promise<IPO>;
  
  // News operations
  getNews(category?: string, market?: string, limit?: number): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;
  
  // Currency operations
  getCurrencyRate(from: string, to: string): Promise<CurrencyRate | undefined>;
  updateCurrencyRate(rate: InsertCurrencyRate): Promise<CurrencyRate>;
  
  // Alert operations
  getUserAlerts(userId: string): Promise<(Alert & { stock: Stock })[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert>;
  deleteAlert(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Stock operations
  async getStock(symbol: string): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocks).where(eq(stocks.symbol, symbol));
    return stock;
  }

  async getStocks(limit = 50): Promise<Stock[]> {
    return await db.select().from(stocks).where(eq(stocks.isActive, true)).limit(limit);
  }

  async searchStocks(query: string, limit = 20): Promise<Stock[]> {
    return await db
      .select()
      .from(stocks)
      .where(
        and(
          eq(stocks.isActive, true),
          or(
            like(stocks.symbol, `%${query.toUpperCase()}%`),
            like(stocks.name, `%${query}%`)
          )
        )
      )
      .limit(limit);
  }

  async createStock(stock: InsertStock): Promise<Stock> {
    const [newStock] = await db.insert(stocks).values(stock).returning();
    return newStock;
  }

  async updateStockPrice(stockId: string, price: number, volume?: number): Promise<void> {
    const [currentPrice] = await db
      .select()
      .from(stockPrices)
      .where(eq(stockPrices.stockId, stockId))
      .orderBy(desc(stockPrices.timestamp))
      .limit(1);

    const previousClose = currentPrice?.price || price;
    const change = price - Number(previousClose);
    const changePercent = (change / Number(previousClose)) * 100;

    await db.insert(stockPrices).values({
      stockId,
      price: price.toString(),
      previousClose: previousClose.toString(),
      change: change.toString(),
      changePercent: changePercent.toString(),
      volume,
    });
  }

  async getStockPrice(stockId: string): Promise<StockPrice | undefined> {
    const [price] = await db
      .select()
      .from(stockPrices)
      .where(eq(stockPrices.stockId, stockId))
      .orderBy(desc(stockPrices.timestamp))
      .limit(1);
    return price;
  }

  async getStockPrices(stockIds: string[]): Promise<StockPrice[]> {
    if (stockIds.length === 0) return [];
    
    return await db
      .select()
      .from(stockPrices)
      .where(inArray(stockPrices.stockId, stockIds))
      .orderBy(desc(stockPrices.timestamp));
  }

  // Portfolio operations
  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    return await db.select().from(portfolios).where(eq(portfolios.userId, userId));
  }

  async getPortfolio(id: string): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
    return portfolio;
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [newPortfolio] = await db.insert(portfolios).values(portfolio).returning();
    return newPortfolio;
  }

  async updatePortfolio(id: string, updates: Partial<Portfolio>): Promise<Portfolio> {
    const [portfolio] = await db
      .update(portfolios)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolios.id, id))
      .returning();
    return portfolio;
  }

  // Holdings operations
  async getPortfolioHoldings(portfolioId: string): Promise<(Holding & { stock: Stock; currentPrice?: StockPrice })[]> {
    const results = await db
      .select({
        holding: holdings,
        stock: stocks,
      })
      .from(holdings)
      .innerJoin(stocks, eq(holdings.stockId, stocks.id))
      .where(eq(holdings.portfolioId, portfolioId));

    const stockIds = results.map(r => r.stock.id);
    const prices = await this.getStockPrices(stockIds);
    const priceMap = new Map(prices.map(p => [p.stockId, p]));

    return results.map(r => ({
      ...r.holding,
      stock: r.stock,
      currentPrice: priceMap.get(r.stock.id),
    }));
  }

  async getHolding(portfolioId: string, stockId: string): Promise<Holding | undefined> {
    const [holding] = await db
      .select()
      .from(holdings)
      .where(and(eq(holdings.portfolioId, portfolioId), eq(holdings.stockId, stockId)));
    return holding;
  }

  async createHolding(holding: InsertHolding): Promise<Holding> {
    const [newHolding] = await db.insert(holdings).values(holding).returning();
    return newHolding;
  }

  async updateHolding(id: string, updates: Partial<Holding>): Promise<Holding> {
    const [holding] = await db
      .update(holdings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(holdings.id, id))
      .returning();
    return holding;
  }

  async deleteHolding(id: string): Promise<void> {
    await db.delete(holdings).where(eq(holdings.id, id));
  }

  // Order operations
  async getUserOrders(userId: string, limit = 50): Promise<(Order & { stock: Stock })[]> {
    const results = await db
      .select({
        order: orders,
        stock: stocks,
      })
      .from(orders)
      .innerJoin(stocks, eq(orders.stockId, stocks.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    return results.map(r => ({ ...r.order, stock: r.stock }));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Watchlist operations
  async getUserWatchlists(userId: string): Promise<Watchlist[]> {
    return await db.select().from(watchlists).where(eq(watchlists.userId, userId));
  }

  async getWatchlistItems(watchlistId: string): Promise<(WatchlistItem & { stock: Stock; currentPrice?: StockPrice })[]> {
    const results = await db
      .select({
        item: watchlistItems,
        stock: stocks,
      })
      .from(watchlistItems)
      .innerJoin(stocks, eq(watchlistItems.stockId, stocks.id))
      .where(eq(watchlistItems.watchlistId, watchlistId));

    const stockIds = results.map(r => r.stock.id);
    const prices = await this.getStockPrices(stockIds);
    const priceMap = new Map(prices.map(p => [p.stockId, p]));

    return results.map(r => ({
      ...r.item,
      stock: r.stock,
      currentPrice: priceMap.get(r.stock.id),
    }));
  }

  async createWatchlist(watchlist: InsertWatchlist): Promise<Watchlist> {
    const [newWatchlist] = await db.insert(watchlists).values(watchlist).returning();
    return newWatchlist;
  }

  async addToWatchlist(watchlistId: string, stockId: string): Promise<WatchlistItem> {
    const [item] = await db
      .insert(watchlistItems)
      .values({ watchlistId, stockId })
      .returning();
    return item;
  }

  async removeFromWatchlist(watchlistId: string, stockId: string): Promise<void> {
    await db
      .delete(watchlistItems)
      .where(
        and(
          eq(watchlistItems.watchlistId, watchlistId),
          eq(watchlistItems.stockId, stockId)
        )
      );
  }

  // IPO operations
  async getIPOs(status?: string, country?: string, limit = 20): Promise<IPO[]> {
    let query = db.select().from(ipos);
    
    const conditions = [];
    if (status) conditions.push(eq(ipos.status, status));
    if (country) conditions.push(eq(ipos.country, country));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(ipos.openDate)).limit(limit);
  }

  async createIPO(ipo: InsertIPO): Promise<IPO> {
    const [newIPO] = await db.insert(ipos).values(ipo).returning();
    return newIPO;
  }

  // News operations
  async getNews(category?: string, market?: string, limit = 20): Promise<News[]> {
    let query = db.select().from(news);
    
    const conditions = [];
    if (category) conditions.push(eq(news.category, category));
    if (market) conditions.push(eq(news.market, market));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(news.publishedAt)).limit(limit);
  }

  async createNews(newsItem: InsertNews): Promise<News> {
    const [newNews] = await db.insert(news).values(newsItem).returning();
    return newNews;
  }

  // Currency operations
  async getCurrencyRate(from: string, to: string): Promise<CurrencyRate | undefined> {
    const [rate] = await db
      .select()
      .from(currencyRates)
      .where(
        and(
          eq(currencyRates.fromCurrency, from),
          eq(currencyRates.toCurrency, to)
        )
      )
      .orderBy(desc(currencyRates.timestamp))
      .limit(1);
    return rate;
  }

  async updateCurrencyRate(rate: InsertCurrencyRate): Promise<CurrencyRate> {
    const [newRate] = await db.insert(currencyRates).values(rate).returning();
    return newRate;
  }

  // Alert operations
  async getUserAlerts(userId: string): Promise<(Alert & { stock: Stock })[]> {
    const results = await db
      .select({
        alert: alerts,
        stock: stocks,
      })
      .from(alerts)
      .innerJoin(stocks, eq(alerts.stockId, stocks.id))
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.createdAt));

    return results.map(r => ({ ...r.alert, stock: r.stock }));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert> {
    const [alert] = await db
      .update(alerts)
      .set(updates)
      .where(eq(alerts.id, id))
      .returning();
    return alert;
  }

  async deleteAlert(id: string): Promise<void> {
    await db.delete(alerts).where(eq(alerts.id, id));
  }
}

export const storage = new DatabaseStorage();
