# 📋 Complete Git Setup & Deployment Guide for StockPulse

## Step 1: Verify Git Installation

First, let's make sure Git is properly installed:

```bash
git --version
```

You should see something like: `git version 2.x.x`

## Step 2: Configure Git (One-time setup)

Set up your Git identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Create GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click the "+" icon** in the top right corner
3. **Select "New repository"**
4. **Fill in the details**:
   - Repository name: `stockpulse`
   - Description: `StockPulse - Financial Trading Platform`
   - Make it **Public** (free hosting on Render)
   - **Don't** initialize with README (we already have files)
5. **Click "Create repository"**

## Step 4: Initialize Git in Your Project

Open PowerShell in your StockPulse directory and run:

```bash
# Navigate to your project directory
cd C:\Users\charu\Downloads\StockPulse\StockPulse

# Initialize Git repository
git init

# Add all files to Git
git add .

# Make your first commit
git commit -m "Initial StockPulse deployment with database setup"

# Add the GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/stockpulse.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

## Step 5: Verify GitHub Upload

1. **Go to your GitHub repository** (https://github.com/YOUR_USERNAME/stockpulse)
2. **Check that all files are uploaded**:
   - You should see: `package.json`, `render.yaml`, `DEPLOYMENT_READY.md`, etc.
   - The repository should show your commit message

## Step 6: Deploy to Render

### 6.1: Create Render Account
1. **Go to [render.com](https://render.com)**
2. **Click "Get Started"**
3. **Sign up with GitHub** (recommended)
4. **Complete the signup process**

### 6.2: Create Web Service
1. **In Render dashboard, click "New +"**
2. **Select "Web Service"**
3. **Connect your GitHub repository**:
   - Click "Connect a repository"
   - Select your `stockpulse` repository
   - Click "Connect"

### 6.3: Configure the Service
Fill in these details:

- **Name**: `stockpulse`
- **Environment**: `Node`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free`

### 6.4: Set Environment Variables
**Before clicking "Create Web Service"**, add these environment variables:

1. **Click "Advanced"** to expand options
2. **Click "Add Environment Variable"**
3. **Add these variables**:

   **Variable 1:**
   - Key: `DATABASE_URL`
   - Value: `postgresql://neondb_owner:npg_C6Rt2PJcoQdu@ep-cold-silence-aejg1u11-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

   **Variable 2:**
   - Key: `NODE_ENV`
   - Value: `production`

### 6.5: Deploy
1. **Click "Create Web Service"**
2. **Wait for deployment** (5-10 minutes)
3. **Watch the build logs** for any errors

## Step 7: Verify Deployment

### 7.1: Check Build Status
- **Green checkmark** = Success
- **Red X** = Error (check logs)

### 7.2: Access Your App
- **Your app URL** will be: `https://stockpulse.onrender.com` (or similar)
- **Click the URL** to test your application

### 7.3: Test the Application
1. **Open your app URL**
2. **Check if the homepage loads**
3. **Test basic functionality**
4. **Check for any errors in browser console**

## Step 8: Troubleshooting Common Issues

### If Build Fails:
1. **Check Render logs** for specific errors
2. **Common issues**:
   - Missing dependencies in `package.json`
   - Environment variables not set correctly
   - Database connection issues

### If App Doesn't Load:
1. **Check the URL** is correct
2. **Wait a few minutes** for first deployment
3. **Check browser console** for errors
4. **Verify environment variables** are set

### If Database Connection Fails:
1. **Verify DATABASE_URL** is correct
2. **Check Neon database** is active
3. **Test connection** locally first

## Step 9: Post-Deployment Tasks

### 9.1: Run Database Migrations (if needed)
1. **In Render dashboard**, go to your service
2. **Click "Shell" tab**
3. **Run**: `npm run db:push`

### 9.2: Set Up Custom Domain (Optional)
1. **In Render dashboard**, go to your service
2. **Click "Settings"**
3. **Add custom domain** if desired

### 9.3: Monitor Your App
1. **Check Render dashboard** regularly
2. **Monitor logs** for any issues
3. **Set up alerts** if needed

## 🎉 Success Checklist

- [ ] Git installed and configured
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web service configured
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] App accessible via URL
- [ ] Basic functionality working

## 📞 Need Help?

If you encounter any issues:
1. **Check the error logs** in Render dashboard
2. **Verify all steps** were followed correctly
3. **Common solutions** are in the troubleshooting section above

Your StockPulse application should now be live and accessible worldwide! 🌍 