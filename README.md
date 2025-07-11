# Roxiler Store Rating Platform

A comprehensive full-stack store rating platform with advanced multi-role authentication, admin management capabilities, and sophisticated filtering/sorting functionality.

##  Features

### Core Functionality
- **Multi-Role Authentication System**: Support for System Administrator, Normal User, and Store Owner roles
- **Advanced Store Rating System**: 1-5 star rating system with real-time analytics
- **Comprehensive Admin Dashboard**: Complete CRUD operations for users, stores, and ratings
- **Professional UI/UX**: Modern, responsive design with dark mode support
- **Real-time Data**: Live updates with optimistic UI patterns

### User Management
- **Role-Based Access Control**: Granular permissions for different user types
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Password Management**: Secure password update functionality
- **User Registration**: Complete onboarding flow for new users

### Store Management
- **Store Listings**: Comprehensive store directory with detailed information
- **Rating Analytics**: Average ratings, total ratings, and user-specific ratings
- **Search & Filter**: Advanced filtering by name, address, and rating criteria
- **Sorting Capabilities**: Sort by name, rating, location, and more

### Technical Features
- **Database**: PostgreSQL with Drizzle ORM for robust data management
- **API Design**: RESTful API with comprehensive error handling
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Modern Stack**: React, Express.js, and cutting-edge tooling

##  Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Query** for state management
- **Wouter** for routing
- **React Hook Form** with Zod validation

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **JWT** authentication
- **bcrypt** for password hashing

### Development Tools
- **Vite** for fast development
- **ESBuild** for production builds
- **Drizzle Kit** for database migrations
- **TypeScript** for type safety

##  Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/roxiler-store-rating-platform.git
   cd roxiler-store-rating-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and secrets.

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Accounts

The application comes with pre-configured test accounts for different user roles:

| Role | Email | Password |
|------|-------|----------|
| System Administrator | admin@roxilerstore.com | Admin123! |
| Normal User | user@roxilerstore.com | User123! |
| Store Owner | store@roxilerstore.com | Store123! |

##  API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/password` - Update password

### User Management
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Store Management
- `GET /api/stores` - Get all stores
- `POST /api/stores` - Create store (Admin only)
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store (Admin only)

### Rating System
- `GET /api/ratings` - Get all ratings
- `POST /api/ratings` - Create rating
- `PUT /api/ratings/:storeId` - Update rating
- `DELETE /api/ratings/:id` - Delete rating

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express application
│   ├── auth.ts           # Authentication middleware
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data access layer
├── shared/               # Shared types and schemas
└── scripts/             # Database seeds and utilities
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Role-Based Access Control**: Granular permissions system
- **Input Validation**: Comprehensive validation using Zod schemas
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM
- **Environment Variables**: Secure configuration management

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Ensure all required environment variables are set in production:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `SESSION_SECRET`: Secret for session management
- `NODE_ENV`: Set to "production"

##  Database Schema

### Users Table
- `id`: Primary key
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password
- `role`: User role (admin/user/store)
- `address`: User's address

### Stores Table
- `id`: Primary key
- `name`: Store name
- `email`: Store contact email
- `address`: Store address
- `ownerId`: Foreign key to users table

### Ratings Table
- `id`: Primary key
- `userId`: Foreign key to users table
- `storeId`: Foreign key to stores table
- `rating`: Rating value (1-5)
- `createdAt`: Timestamp

