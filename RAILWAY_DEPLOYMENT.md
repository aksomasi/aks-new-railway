# Railway Deployment Guide

## Prerequisites
- Railway account (railway.app)
- GitHub repository with your code

## Deployment Steps

### 1. Create MySQL Database
1. Go to Railway dashboard
2. Click "New" → "Database" → "MySQL"
3. Note the database connection details

### 2. Deploy Application
1. Click "New" → "GitHub Repo"
2. Connect your repository
3. Railway will auto-detect and build your app

### 3. Environment Variables
Railway automatically provides these MySQL variables:
- `MYSQLHOST`
- `MYSQLUSER` 
- `MYSQLPASSWORD`
- `MYSQLDATABASE`
- `MYSQLPORT`
- `PORT`

### 4. Run Database Migration
After deployment, use Railway's console:
```bash
npm run migrate
```

### 5. Access Your App
Your app will be available at the Railway-provided URL.

## Database Access
- Railway provides a managed MySQL database
- Connection details are automatically injected
- Access via Railway dashboard or connect directly

## Build Process
1. Installs client dependencies and builds Angular app
2. Installs server dependencies and builds TypeScript
3. Serves Angular static files from Node.js server
4. Single deployment unit

## File Structure Changes Made
- Root `package.json` for unified build
- `railway.toml` for Railway configuration  
- Updated `server.ts` to serve Angular static files
- Updated Angular build output path
- Environment configurations for production

Your app is now ready for Railway deployment!