import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for flexible authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  buyingPower: decimal("buying_power", { precision: 15, scale: 2 }).default('10000.00'),
  preferredCurrency: varchar("preferred_currency").default('USD'),
  // Authentication fields
  authMethod: varchar("auth_method").default('email'), // email, google, github
  hashedPassword: text("hashed_password"), // Only for email auth
  socialId: varchar("social_id"), // For social auth
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stocks table for both US and Indian markets
export const stocks = pgTable("stocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: varchar("symbol").notNull().unique(),
  name: text("name").notNull(),
  exchange: varchar("exchange").notNull(), // NASDAQ, NYSE, NSE, BSE
  sector: varchar("sector"),
  industry: varchar("industry"),
  country: varchar("country").notNull(), // US, IN
  currency: varchar("currency").notNull(), // USD, INR
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  peRatio: decimal("pe_ratio", { precision: 10, scale: 2 }),
  dividendYield: decimal("dividend_yield", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Real-time stock prices
export const stockPrices = pgTable("stock_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stockId: varchar("stock_id").notNull().references(() => stocks.id),
  price: decimal("price", { precision: 15, scale: 4 }).notNull(),
  previousClose: decimal("previous_close", { precision: 15, scale: 4 }),
  change: decimal("change", { precision: 15, scale: 4 }),
  changePercent: decimal("change_percent", { precision: 8, scale: 4 }),
  volume: integer("volume"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// User portfolios
export const portfolios = pgTable("portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull().default('My Portfolio'),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).default('0.00'),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).default('0.00'),
  totalGainLoss: decimal("total_gain_loss", { precision: 15, scale: 2 }).default('0.00'),
  dayGainLoss: decimal("day_gain_loss", { precision: 15, scale: 2 }).default('0.00'),
  isDefault: boolean("is_default").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio holdings
export const holdings = pgTable("holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: varchar("portfolio_id").notNull().references(() => portfolios.id),
  stockId: varchar("stock_id").notNull().references(() => stocks.id),
  quantity: integer("quantity").notNull(),
  averageCost: decimal("average_cost", { precision: 15, scale: 4 }).notNull(),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }),
  gainLoss: decimal("gain_loss", { precision: 15, scale: 2 }),
  gainLossPercent: decimal("gain_loss_percent", { precision: 8, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  portfolioId: varchar("portfolio_id").notNull().references(() => portfolios.id),
  stockId: varchar("stock_id").notNull().references(() => stocks.id),
  type: varchar("type").notNull(), // BUY, SELL
  orderType: varchar("order_type").notNull(), // MARKET, LIMIT, STOP
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 15, scale: 4 }),
  limitPrice: decimal("limit_price", { precision: 15, scale: 4 }),
  stopPrice: decimal("stop_price", { precision: 15, scale: 4 }),
  status: varchar("status").notNull().default('PENDING'), // PENDING, FILLED, CANCELLED, REJECTED
  filledQuantity: integer("filled_quantity").default(0),
  filledPrice: decimal("filled_price", { precision: 15, scale: 4 }),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }),
  fees: decimal("fees", { precision: 10, scale: 2 }).default('0.00'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User watchlists
export const watchlists = pgTable("watchlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull().default('My Watchlist'),
  isDefault: boolean("is_default").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Watchlist items
export const watchlistItems = pgTable(
  "watchlist_items",
  {
    watchlistId: varchar("watchlist_id").notNull().references(() => watchlists.id),
    stockId: varchar("stock_id").notNull().references(() => stocks.id),
    addedAt: timestamp("added_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.watchlistId, table.stockId] }),
  })
);

// IPOs (Initial Public Offerings)
export const ipos = pgTable("ipos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: varchar("company_name").notNull(),
  symbol: varchar("symbol"),
  exchange: varchar("exchange").notNull(),
  country: varchar("country").notNull(),
  currency: varchar("currency").notNull(),
  priceMin: decimal("price_min", { precision: 10, scale: 2 }),
  priceMax: decimal("price_max", { precision: 10, scale: 2 }),
  issueSize: decimal("issue_size", { precision: 15, scale: 2 }),
  openDate: timestamp("open_date"),
  closeDate: timestamp("close_date"),
  listingDate: timestamp("listing_date"),
  status: varchar("status").notNull().default('UPCOMING'), // UPCOMING, OPEN, CLOSED, LISTED
  category: varchar("category"), // MAINBOARD, SME
  sector: varchar("sector"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Market news
export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  source: varchar("source"),
  author: varchar("author"),
  url: text("url"),
  imageUrl: text("image_url"),
  category: varchar("category"), // TECHNOLOGY, FINANCE, GLOBAL, etc.
  market: varchar("market"), // US, IN, GLOBAL
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Currency exchange rates
export const currencyRates = pgTable("currency_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromCurrency: varchar("from_currency").notNull(),
  toCurrency: varchar("to_currency").notNull(),
  rate: decimal("rate", { precision: 15, scale: 6 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Market alerts
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  stockId: varchar("stock_id").notNull().references(() => stocks.id),
  type: varchar("type").notNull(), // PRICE_ABOVE, PRICE_BELOW, VOLUME_SPIKE
  condition: varchar("condition").notNull(),
  targetValue: decimal("target_value", { precision: 15, scale: 4 }).notNull(),
  isActive: boolean("is_active").default(true),
  isTriggered: boolean("is_triggered").default(false),
  triggeredAt: timestamp("triggered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
  watchlists: many(watchlists),
  orders: many(orders),
  alerts: many(alerts),
}));

export const stocksRelations = relations(stocks, ({ many }) => ({
  prices: many(stockPrices),
  holdings: many(holdings),
  orders: many(orders),
  watchlistItems: many(watchlistItems),
  alerts: many(alerts),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  holdings: many(holdings),
  orders: many(orders),
}));

export const holdingsRelations = relations(holdings, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [holdings.portfolioId],
    references: [portfolios.id],
  }),
  stock: one(stocks, {
    fields: [holdings.stockId],
    references: [stocks.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  portfolio: one(portfolios, {
    fields: [orders.portfolioId],
    references: [portfolios.id],
  }),
  stock: one(stocks, {
    fields: [orders.stockId],
    references: [stocks.id],
  }),
}));

export const watchlistsRelations = relations(watchlists, ({ one, many }) => ({
  user: one(users, {
    fields: [watchlists.userId],
    references: [users.id],
  }),
  items: many(watchlistItems),
}));

export const watchlistItemsRelations = relations(watchlistItems, ({ one }) => ({
  watchlist: one(watchlists, {
    fields: [watchlistItems.watchlistId],
    references: [watchlists.id],
  }),
  stock: one(stocks, {
    fields: [watchlistItems.stockId],
    references: [stocks.id],
  }),
}));

export const stockPricesRelations = relations(stockPrices, ({ one }) => ({
  stock: one(stocks, {
    fields: [stockPrices.stockId],
    references: [stocks.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
  stock: one(stocks, {
    fields: [alerts.stockId],
    references: [stocks.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHoldingSchema = createInsertSchema(holdings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWatchlistItemSchema = createInsertSchema(watchlistItems);

export const insertIPOSchema = createInsertSchema(ipos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
});

export const insertCurrencyRateSchema = createInsertSchema(currencyRates).omit({
  id: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Stock types
export type Stock = typeof stocks.$inferSelect;
export type InsertStock = typeof stocks.$inferInsert;

// Order types  
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Portfolio types
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = typeof portfolios.$inferInsert;

// Holding types
export type Holding = typeof holdings.$inferSelect;
export type InsertHolding = typeof holdings.$inferInsert;

// Watchlist types
export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = typeof watchlists.$inferInsert;

// IPO types
export type IPO = typeof ipos.$inferSelect;
export type InsertIPO = typeof ipos.$inferInsert;

// News types
export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;

// Enhanced Zod schemas for API validation
export const insertOrderSchemaAPI = createInsertSchema(orders).omit({
  id: true,
  userId: true,
  portfolioId: true,
  stockId: true,
  status: true,
  filledQuantity: true,
  filledPrice: true,
  totalValue: true,
  fees: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  symbol: z.string().min(1, "Symbol is required"),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["market", "limit"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().optional(),
});

export const insertWatchlistItemSchemaAPI = createInsertSchema(watchlistItems).omit({
  addedAt: true,
});

export const insertAlertSchemaAPI = createInsertSchema(alerts).omit({
  id: true,
  userId: true,
  isActive: true,
  isTriggered: true,
  triggeredAt: true,
  createdAt: true,
});

export type StockPrice = typeof stockPrices.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertHolding = z.infer<typeof insertHoldingSchema>;
export type Holding = typeof holdings.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlistItem = z.infer<typeof insertWatchlistItemSchema>;
export type WatchlistItem = typeof watchlistItems.$inferSelect;
export type InsertIPO = z.infer<typeof insertIPOSchema>;
export type IPO = typeof ipos.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;
export type InsertCurrencyRate = z.infer<typeof insertCurrencyRateSchema>;
export type CurrencyRate = typeof currencyRates.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
