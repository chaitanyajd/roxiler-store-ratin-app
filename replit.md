# Store Rating Platform

## Overview

This is a full-stack web application for a store rating platform that allows users to rate and review stores. The system supports three types of users: regular users who can rate stores, store owners who can manage their stores, and administrators who can manage the entire platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## Test Accounts

### System Administrator
- Email: admin@roxilerstore.com
- Password: Admin123!

### Normal User
- Email: user@roxilerstore.com
- Password: User123!

### Store Owner
- Email: store@roxilerstore.com
- Password: Store123!

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **Form Management**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon (serverless PostgreSQL)
- **Authentication**: JWT tokens with bcrypt for password hashing
- **API Design**: RESTful API with role-based access control

### Project Structure
The application follows a monorepo structure with:
- `client/` - Frontend React application
- `server/` - Backend Express.js application
- `shared/` - Shared types and schemas between frontend and backend

## Key Components

### Authentication System
- JWT-based authentication with 7-day token expiration
- Role-based access control (admin, user, store)
- Password hashing with bcrypt
- Secure token storage in localStorage

### Database Schema
Three main entities:
- **Users**: Stores user information including name, email, password, address, and role
- **Stores**: Contains store details with owner relationship to users
- **Ratings**: Links users to stores with rating values (1-5 scale)

### User Roles and Permissions
- **Admin**: Full system access, can manage users, stores, and ratings
- **User**: Can rate stores and view store information
- **Store**: Can view their own store ratings and statistics

### UI Components
- Comprehensive component library using shadcn/ui
- Responsive design with mobile-first approach
- Form validation with real-time feedback
- Toast notifications for user feedback

## Data Flow

1. **Authentication Flow**:
   - User submits credentials → Server validates → JWT token generated → Token stored client-side
   - Protected routes check token validity before API calls

2. **Rating Flow**:
   - User selects store → Rating form displayed → Rating submitted → Database updated → UI refreshed

3. **Admin Management Flow**:
   - Admin accesses dashboard → Fetches data via API → Displays management interfaces → CRUD operations via API

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: TypeScript ORM for database operations
- **@tanstack/react-query**: Data fetching and caching
- **express**: Web framework for Node.js
- **jsonwebtoken**: JWT token handling
- **bcryptjs**: Password hashing
- **zod**: Schema validation

### UI Dependencies
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form management
- **wouter**: Lightweight routing

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- Node.js/Express server with auto-reload
- Environment variables for database configuration
- Integrated development with Replit-specific plugins

### Production Build
- Frontend: Vite build generates static assets
- Backend: esbuild bundles Node.js application
- Database: Neon serverless PostgreSQL (no local setup required)
- Environment: Production configuration via environment variables

### Database Management
- Drizzle migrations for schema changes
- Push command for development schema updates
- PostgreSQL dialect with connection pooling

The application is designed to be deployed on Replit with minimal configuration, leveraging serverless database solutions and modern build tools for optimal performance and developer experience.