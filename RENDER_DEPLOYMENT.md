# Deploy StockPulse to Render

## Step 1: Prepare Your Code
1. Make sure all your changes are committed to Git
2. Push your code to GitHub (if not already done)

## Step 2: Set Up Database
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://username:password@host/database`)

## Step 3: Deploy to Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `stockpulse` (or any name you prefer)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

## Step 4: Set Environment Variables
In the Render dashboard, go to your service and add these environment variables:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `NODE_ENV`: `production`

## Step 5: Deploy
Click "Create Web Service" and wait for the deployment to complete.

## Step 6: Run Database Migrations
After deployment, you can run migrations by:
1. Going to your service in Render dashboard
2. Click on "Shell" tab
3. Run: `npm run db:push`

## Your app will be live at: `https://your-app-name.onrender.com`

## Troubleshooting
- If build fails, check the logs in Render dashboard
- If database connection fails, verify your DATABASE_URL
- Make sure all dependencies are in package.json 