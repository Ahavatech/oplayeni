git clone [your-repository-url]
cd [repository-name]
```

2. Install dependencies
```bash
npm install
```

3. Set up your environment variables by creating a `.env` file:
```env
# Database connection URL
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

# Session secret for authentication (can be any secure random string)
SESSION_SECRET=your_session_secret
```

4. Set up the database
```bash
npm run db:push
```

5. Create an initial admin account
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-secure-password"}'
```

6. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Admin Access

To access the admin interface:
1. Navigate to `/admin` route
2. Log in with your admin credentials
3. Use the admin dashboard to manage:
   - Publications
   - Teaching materials
   - Research content

## Project Structure

```
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   └── lib/        # Utilities and helpers
├── server/             # Backend Express application
│   ├── routes.ts       # API routes
│   └── storage.ts      # Data storage interface
└── shared/             # Shared types and schemas
```

## Setting Up for Development

1. Clone the repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin [your-github-repo-url]
git push -u origin main
```

2. Database Setup:
   - Create a new PostgreSQL database
   - Update the DATABASE_URL in your .env file
   - Run `npm run db:push` to apply the schema

3. Environment Variables:
   Make sure your `.env` file includes:
   ```env
   DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
   SESSION_SECRET=your-secure-random-string