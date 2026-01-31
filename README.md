# 🍱 FoodHub Backend API

A robust, scalable RESTful API for a food delivery platform built with modern technologies. FoodHub connects customers with food providers, enabling seamless meal ordering, menu management, and platform administration.

![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Server](#-running-the-server)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [User Roles](#-user-roles)
- [Error Handling](#-error-handling)
- [Deployment](#-deployment)
- [Admin Credentials](#-admin-credentials)


---

## ✨ Features

### 🔐 Authentication & Security
- Secure authentication with [Better Auth](https://www.better-auth.com/)
- Session-based authentication with secure cookies
- Password hashing with industry-standard algorithms
- Role-based access control (RBAC)
- User ban/suspend functionality

### 👥 User Management
- Three distinct user roles: Customer, Provider, Admin
- User profile management
- Account suspension/activation by admin

### 🍽️ Meal Management
- Full CRUD operations for meals
- Advanced filtering (category, price range, availability)
- Sorting options (price, rating, popularity, newest)
- Pagination support
- Image support for meal items

### 🛒 Order System
- Cart-to-order workflow
- Order status tracking (Placed → Preparing → Ready → Delivered)
- Order history for customers
- Order management for providers
- Cash on Delivery payment model

### ⭐ Review System
- Customer reviews for meals
- Rating system (1-5 stars)
- One review per user per meal
- Review management (update/delete own reviews)

### 📊 Admin Dashboard
- Platform statistics
- User management (view, ban/unban)
- Category management (CRUD)
- Order monitoring across platform

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express 5** | Web framework |
| **TypeScript** | Type safety |
| **Prisma 7** | ORM & database toolkit |
| **PostgreSQL** | Database (Neon) |
| **Better Auth** | Authentication |
| **Zod** | Schema validation |
| **Morgan** | HTTP request logging |
| **CORS** | Cross-origin resource sharing |

---

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── migrations/       # Database migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   │   ├── admin.controller.ts
│   │   ├── category.controller.ts
│   │   ├── meal.controller.ts
│   │   ├── order.controller.ts
│   │   ├── provider.controller.ts
│   │   ├── review.controller.ts
│   │   └── user.controller.ts
│   ├── lib/              # Library configurations
│   │   ├── auth.ts       # Better Auth setup
│   │   └── prisma.ts     # Prisma client
│   ├── middlewares/      # Express middlewares
│   │   ├── errorHandler.ts
│   │   ├── requireAuth.ts
│   │   ├── requireRole.ts
│   │   └── validate.ts
│   ├── routes/           # API routes
│   │   ├── admin.routes.ts
│   │   ├── category.routes.ts
│   │   ├── meal.routes.ts
│   │   ├── order.routes.ts
│   │   ├── provider.routes.ts
│   │   ├── review.routes.ts
│   │   └── user.routes.ts
│   ├── services/         # Business logic
│   │   ├── admin.service.ts
│   │   ├── category.service.ts
│   │   ├── meal.service.ts
│   │   ├── order.service.ts
│   │   ├── provider.service.ts
│   │   ├── review.service.ts
│   │   └── user.service.ts
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   │   ├── AppError.ts   # Custom error classes
│   │   └── response.util.ts
│   ├── validations/      # Zod schemas
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── .env                  # Environment variables
├── package.json
├── tsconfig.json
└── API_DOCUMENTATION.md  # API reference
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v20 or higher
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wasif23ahad/foodHub-backend.git
   cd foodHub-backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Generate Prisma client**
   ```bash
   pnpm db:generate
   ```

5. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

6. **Seed the database**
   ```bash
   pnpm db:seed
   ```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Server
PORT=5000
NODE_ENV=development

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-characters"
BETTER_AUTH_URL="http://localhost:5000"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# Admin Credentials (for seeding)
ADMIN_EMAIL="admin@foodhub.com"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="Admin"
```

---

## 🗄️ Database Setup

### Using Neon (Recommended)

1. Create a free account at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string to your `.env`

### Database Commands

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:push` | Push schema changes (dev) |
| `pnpm db:seed` | Seed database |
| `pnpm db:studio` | Open Prisma Studio |

### Database Schema

The database includes the following tables:

- **user** - User accounts and authentication
- **session** - User sessions
- **account** - OAuth/credential accounts
- **verification** - Email verification tokens
- **providerProfile** - Food provider profiles
- **category** - Food categories
- **meal** - Menu items
- **order** - Customer orders
- **orderItem** - Order line items
- **review** - Customer reviews

---

## ▶️ Running the Server

### Development
```bash
pnpm dev
```
Server runs at `http://localhost:5000`

### Production
```bash
pnpm build
pnpm start
```

---

## 📚 API Documentation

For complete API reference, see **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

### Quick Reference

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/health` | GET | Health check | No |
| `/api/auth/*` | ALL | Authentication | No |
| `/api/meals` | GET | Browse meals | No |
| `/api/categories` | GET | List categories | No |
| `/api/providers` | GET | List providers | No |
| `/api/orders` | POST | Create order | Yes |
| `/api/provider/*` | ALL | Provider dashboard | Provider |
| `/api/admin/*` | ALL | Admin dashboard | Admin |

---

## 🔐 Authentication

This API uses [Better Auth](https://www.better-auth.com/) for authentication.

### Auth Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-up/email` | POST | Register new user |
| `/api/auth/sign-in/email` | POST | Login with email/password |
| `/api/auth/sign-out` | POST | Logout |
| `/api/auth/session` | GET | Get current session |

### Authentication Headers

```
Cookie: better-auth.session_token=<token>
```

Or use the session token in requests:
```
Authorization: Bearer <token>
```

---

## 👥 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **CUSTOMER** | Regular users | Browse, order, review meals |
| **PROVIDER** | Food vendors | All customer perms + manage menu & orders |
| **ADMIN** | Administrators | All perms + manage users & categories |

### Role Selection

Users select their role during registration. Admin accounts are seeded in the database.

---

## ⚠️ Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["error message"]
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## 🚢 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Render Deployment

1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `pnpm install && pnpm build`
4. Set start command: `pnpm start`
5. Add environment variables

---

## 🔑 Admin Credentials

For testing and submission:

| Field | Value |
|-------|-------|
| **Email** | `admin@foodhub.com` |
| **Password** | `admin123` |

> ⚠️ **Note**: Change these credentials in production by setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables before seeding.

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:push` | Push schema to database |
| `pnpm db:seed` | Seed database |
| `pnpm db:studio` | Open Prisma Studio |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---



## 👨‍💻 Author

**Mohammad Wasif Ahad**

- GitHub: [@wasif23ahad](https://github.com/wasif23ahad)

---

<div align="center">

**[📖 View Full API Documentation](./API_DOCUMENTATION.md)**

Made with ❤️ for Programming Hero Assignment 4

</div>
