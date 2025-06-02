# Deployment Instructions for Family Travel Tracker

## Option 1: Deploy to Render (Simplest)

1. **Create a Render Account**
   - Go to [render.com](https://render.com/) and sign up

2. **Create a new Web Service**
   - Click "New" and select "Web Service"
   - Connect to your GitHub repository or upload via Git URL

3. **Configure Your Web Service**
   - Name: `family-travel-tracker`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables**
   Add the following environment variables:
   ```
   DATABASE_URL=postgres://postgres:FNh9LH5O1ODmst7o@db.yipvctqgluwqwaashbat.supabase.co:5432/postgres
   NODE_ENV=production
   PORT=3000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the deployment to complete
   - Access your app at the URL provided by Render

## Option 2: Deploy to Railway Manually

1. **Create a Railway Account**
   - Go to [railway.app](https://railway.app/) and sign up

2. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo" 
   - Connect to your GitHub repository

3. **Configure Deployment**
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables**
   Add the following environment variables in the Railway dashboard:
   ```
   DATABASE_URL=postgres://postgres:FNh9LH5O1ODmst7o@db.yipvctqgluwqwaashbat.supabase.co:5432/postgres
   NODE_ENV=production
   PORT=3000
   ```

5. **Deploy**
   - Click "Deploy" in the Railway dashboard
   - Wait for the deployment to complete
   - Access your app at the URL provided by Railway

## Option 3: Deploy to Netlify

1. **Create a Netlify Account**
   - Go to [netlify.com](https://netlify.com/) and sign up

2. **Create a New Site**
   - Click "Import an existing project"
   - Connect to your GitHub repository

3. **Configure Build Settings**
   - Build Command: `npm install`
   - Publish Directory: `public`

4. **Add Environment Variables**
   Add the following environment variables in Netlify:
   ```
   DATABASE_URL=postgres://postgres:FNh9LH5O1ODmst7o@db.yipvctqgluwqwaashbat.supabase.co:5432/postgres
   NODE_ENV=production
   PORT=3000
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for the deployment to complete
   - Access your app at the URL provided by Netlify
