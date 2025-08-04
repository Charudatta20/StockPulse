# StockPulse Deployment Guide

## Prerequisites

1. **Database Setup**: You need a PostgreSQL database (Neon, Supabase, or Railway PostgreSQL)
2. **Environment Variables**: Set up your DATABASE_URL

## Deployment Options

### Option 1: Railway (Recommended)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Railway Project**:
   ```bash
   railway init
   ```

4. **Add PostgreSQL Database**:
   - Go to Railway Dashboard
   - Create a new PostgreSQL database
   - Copy the DATABASE_URL

5. **Set Environment Variables**:
   ```bash
   railway variables set DATABASE_URL="your-postgresql-connection-string"
   railway variables set NODE_ENV="production"
   ```

6. **Deploy**:
   ```bash
   railway up
   ```

### Option 2: Render

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `NODE_ENV`: `production`

### Option 3: Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel Dashboard

### Option 4: Heroku

1. **Install Heroku CLI**
2. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   ```

3. **Add PostgreSQL**:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

## Database Setup

### Using Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create a free account and project
3. Copy the connection string
4. Set as `DATABASE_URL` environment variable

### Using Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a free project
3. Get the connection string from Settings > Database
4. Set as `DATABASE_URL` environment variable

## Environment Variables Required

```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=5000
```

## Post-Deployment Steps

1. **Run Database Migrations**:
   ```bash
   npm run db:push
   ```

2. **Verify Deployment**:
   - Check your application URL
   - Test the API endpoints
   - Verify database connections

## Troubleshooting

### Common Issues:
1. **Database Connection Failed**: Check DATABASE_URL format
2. **Build Failed**: Ensure all dependencies are in package.json
3. **Port Issues**: Make sure PORT environment variable is set
4. **Static Files Not Serving**: Check vite.config.ts build configuration

### Logs:
- Railway: `railway logs`
- Render: Check dashboard logs
- Vercel: `vercel logs`
- Heroku: `heroku logs --tail` 