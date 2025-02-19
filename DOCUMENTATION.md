
# Academic Portfolio Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Admin Features](#admin-features)
4. [Backend Architecture](#backend-architecture)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)

## Project Overview
A full-stack web application for managing an academic portfolio, built with React, Express, and MongoDB.

## Frontend Architecture

### Technology Stack
- React + TypeScript
- TailwindCSS + shadcn/ui
- Tanstack Query
- Wouter for routing

### Directory Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── layout/    # Layout components
│   │   └── ui/        # UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and configurations
│   └── pages/         # Page components
```

### Key Features
- Responsive design
- Server-state management with React Query
- Modular component architecture
- Dark/light theme support

## Admin Features

### Authentication
- Secure login system
- Session-based authentication
- Protected admin routes

### Content Management
- Publications management
- Teaching materials management
- Research content management
- Talks/presentations management

## Backend Architecture

### Technology Stack
- Express + TypeScript
- MongoDB with Mongoose
- Express session for auth

### API Structure
```
server/
├── auth.ts      # Authentication logic
├── routes.ts    # API routes
├── storage.ts   # Data storage interface
└── db.ts        # Database connection
```

### Key Features
- RESTful API design
- Middleware for authentication
- Error handling
- File upload support

## Database Schema

### Collections
1. Users
   - username
   - password (hashed)
   - role

2. Publications
   - title
   - authors
   - journal
   - year
   - link

3. Teaching
   - title
   - description
   - materials
   - semester

4. Research
   - title
   - description
   - category
   - collaborators

## API Documentation

### Authentication Endpoints
- POST `/api/admin/login`
- POST `/api/admin/logout`

### Content Endpoints
- GET/POST `/api/publications`
- GET/POST `/api/teaching`
- GET/POST `/api/research`
- GET/POST `/api/talks`

### File Management
- POST `/api/upload`
- DELETE `/api/files/:id`
