# Academic Portfolio Platform

A modern academic portfolio platform designed for researchers to showcase their professional work with robust content management capabilities.

## Tech Stack

- React frontend with TypeScript
- Node.js/Express backend
- MongoDB database
- Responsive design using Tailwind CSS
- Authentication with Passport.js

## Deployment Guide

### 1. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is sufficient)
3. Under Security > Database Access, create a database user
4. Under Security > Network Access, add `0.0.0.0/0` to allow access from anywhere
5. Under Databases, click "Connect" and choose "Connect your application"
6. Copy the connection string, it will look like: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>`
7. Replace `<username>`, `<password>`, and `<dbname>` with your values

### 2. Render Deployment

1. Create a Render account at [https://render.com](https://render.com)
2. From your dashboard, click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `academic-portfolio` (or your preferred name)
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: Free (or your preferred tier)

### 3. Environment Variables

In Render, under your web service's "Environment" tab, add these variables:

```
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_random_secret_string
NODE_ENV=production
```

### 4. First-time Setup

After deployment:

1. Visit your application URL
2. Login with the default admin credentials:
   - Username: `admin`
   - Password: `admin123`
3. Change the admin password immediately through the admin dashboard
4. Update the profile information with your academic details

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/academic-portfolio.git
cd academic-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following:
```
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=any_random_string
```

4. Start the development server:
```bash
npm run dev
```

## Features

- Profile management
- Course catalog with materials
- Research publications listing
- Conference and talks management
- Admin dashboard for content management
- Responsive design for all devices

## Security Considerations

- Always use HTTPS in production
- Change the default admin password immediately
- Keep your MongoDB connection string and session secret secure
- Regularly update dependencies for security patches
