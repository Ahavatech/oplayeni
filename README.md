git clone [your-repository-url]
cd [repository-name]
```

2. Install dependencies
```bash
npm install
```

3. Set up your environment variables by creating a `.env` file:
```env
# MongoDB connection URL
MONGODB_URI=mongodb://[username]:[password]@[host]:[port]/[database]

# Session secret for authentication (can be any secure random string)
SESSION_SECRET=your_session_secret
```

4. Start the development server
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