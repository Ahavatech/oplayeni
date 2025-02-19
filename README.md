# Academic Portfolio - Prof. Olawanle Patrick Layeni

A professional academic portfolio website showcasing research, teaching, and publications in mathematics, specifically focusing on solid mechanics and continuum mechanics.

## Features

- Professional academic profile presentation
- Research areas and publications showcase
- Teaching materials and course information
- Upcoming talks and events
- Contact information
- Admin interface for content management

## Technology Stack

- Frontend: React with TypeScript
- Styling: Tailwind CSS with shadcn/ui components
- Backend: Express.js
- Authentication: Session-based auth for admin access
- Data Storage: In-memory storage (configurable for PostgreSQL)

## Local Development Setup

### Prerequisites

- Node.js (v18 or v20)
- npm (comes with Node.js)
- Git

### Installation

1. Clone the repository
```bash
git clone [your-github-repo-url]
cd [repository-name]
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Admin Access

The admin interface is available at `/admin`. Contact the repository owner for admin credentials.

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
