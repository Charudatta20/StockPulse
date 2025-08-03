# StockPulse - Financial Trading Platform

## Overview

StockPulse is a modern full-stack financial trading and investment platform that provides users with real-time global stock market data, portfolio management, and trading capabilities. The application supports both US and Indian markets, offering comprehensive tools for stock trading, portfolio tracking, watchlist management, IPO monitoring, and financial news aggregation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
**Framework**: React with TypeScript using Vite as the build tool for fast development and optimized production builds. The application uses Wouter for lightweight client-side routing.

**UI Component Library**: Built on Shadcn/ui components powered by Radix UI primitives, providing accessible and customizable UI components with consistent design patterns. The design system includes financial-specific styling for gains/losses and market data visualization.

**Styling System**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes with financial-specific color schemes for market data representation.

**State Management**: TanStack Query (React Query) handles all server state management, caching, and data synchronization. React Context is used for theme and currency preferences.

**Real-time Features**: WebSocket connections provide live market data updates for stock prices across both USD and INR markets.

### Backend Architecture
**Runtime Environment**: Node.js with Express.js framework using TypeScript and ES modules for modern JavaScript features.

**API Design**: RESTful API architecture with dedicated endpoints for stocks, portfolios, trades, IPOs, watchlists, orders, news, and market data. WebSocket server handles real-time price streaming.

**Authentication**: Replit Auth integration with session-based authentication using Express sessions stored in PostgreSQL. Custom middleware provides route protection and user context.

**Database Integration**: Drizzle ORM provides type-safe database interactions with PostgreSQL, using centralized schema definitions in the shared directory.

**Build System**: ESBuild for server-side bundling and Vite for client-side builds, optimized for both development and production environments.

### Data Storage Solutions
**Primary Database**: PostgreSQL hosted on Neon serverless platform for scalable cloud database management.

**Schema Management**: Drizzle Kit handles database migrations with comprehensive schema definitions including users, stocks, portfolios, holdings, trades, IPOs, orders, watchlists, market alerts, currency rates, and news articles.

**Session Storage**: PostgreSQL-based session storage for authentication persistence using connect-pg-simple.

**Data Validation**: Zod schema validation integrated with Drizzle for runtime type checking and data validation across the application.

## External Dependencies

**Database Service**: Neon serverless PostgreSQL for primary data storage
**Authentication**: Replit Auth for user authentication and session management
**UI Components**: Radix UI primitives for accessible component foundation
**Build Tools**: Vite for frontend bundling, ESBuild for server bundling
**ORM**: Drizzle ORM with Drizzle Kit for database management
**Real-time Communication**: WebSocket (ws) for live market data streaming
**Styling**: Tailwind CSS with PostCSS for responsive design
**Form Handling**: React Hook Form with Hookform Resolvers for form validation
**Date Utilities**: date-fns for date formatting and manipulation