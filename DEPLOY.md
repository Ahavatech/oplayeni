# Deploying to Render

Follow these steps to deploy your academic portfolio to Render:

1. Create a MongoDB Atlas Database:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user and note down the credentials
   - Get your MongoDB connection string
   - Replace `<password>` with your actual password in the connection string

2. Create a new Web Service on Render:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Fill in the following details:
     - Name: `academic-portfolio` (or your preferred name)
     - Environment: `Node`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm run start`
   
3. Add Environment Variables:
   - In your Render web service settings, add the following environment variables:
     - `NODE_ENV`: `production`
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - Add any other secret keys your application needs

4. Deploy:
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Your site will be live at `https://your-app-name.onrender.com`

Note: Make sure your MongoDB Atlas cluster's network access allows connections from anywhere (0.0.0.0/0) or specifically from Render's IP addresses.
