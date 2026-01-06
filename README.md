# Shl — Full-Stack User Authentication System

A modern full-stack web application built with **Vue 3**, **Express**, **TypeScript**, and **PostgreSQL**. This project provides a complete user authentication system with session management, role-based access control, and a responsive frontend interface.

## 🚀 What Does This Project Do?

Shl is a full-stack authentication and user management system that includes:

- **User Registration & Login**: Secure authentication with bcrypt password hashing and JWT tokens
- **Session Management**: Cookie-based session tracking with database persistence
- **Role-Based Access Control**: Admin and User roles with middleware protection
- **RESTful API**: Express-based backend with Prisma ORM for database operations
- **Modern Frontend**: Vue 3 single-page application with Vite, Vue Router, and Pinia state management
- **Styled UI**: Tailwind CSS for responsive and modern design

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express** — Web server framework
- **TypeScript** — Type-safe JavaScript
- **Prisma** — Modern ORM for PostgreSQL
- **PostgreSQL** — Relational database
- **JWT & bcrypt** — Authentication and password security
- **CORS & cookie-parser** — Cross-origin and session handling

### Frontend
- **Vue 3** — Progressive JavaScript framework
- **Vite** — Fast build tool and dev server
- **TypeScript** — Type-safe development
- **Vue Router** — Client-side routing
- **Pinia** — State management
- **Tailwind CSS** — Utility-first CSS framework

### DevOps
- **Docker & Docker Compose** — Containerized development environment
- **pgAdmin** — PostgreSQL administration interface
- **GitHub Actions** — Automated CI/CD pipeline

## 🔄 GitHub Actions Workflow

The project includes a **CI (Continuous Integration)** workflow that automatically runs on every push and pull request:

### Backend Job
- Sets up Node.js 20 environment
- Spins up a PostgreSQL 16 service for testing
- Installs dependencies with `npm ci`
- Generates Prisma client
- Runs TypeScript type checking (`npm test`)

### Frontend Job
- Sets up Node.js 20 environment
- Installs dependencies with `npm ci`
- Builds the production bundle with Vite

The workflow ensures code quality and prevents broken builds from being merged into the main branch.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Git** for cloning the repository

> **Note**: You don't need Node.js or PostgreSQL installed locally — Docker handles everything!

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Shun-Lassal/Shl.git
cd Shl
```

### 2. Start the Application with Docker Compose

```bash
docker-compose up -d
```

This single command will:
- Build and start the **PostgreSQL database** on port `5432`
- Build and start the **backend API** on port `3000`
- Build and start the **frontend SPA** on port `5173`
- Launch **pgAdmin** on port `8080` for database management

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **pgAdmin**: http://localhost:8080 (login: `admin@admin.com` / `admin`)

### 4. Stop the Application

```bash
docker-compose down
```

To also remove the database volumes:

```bash
docker-compose down -v
```

## 🌐 Share Your Local Instance on the LAN

Want teammates on the same network (e.g. `172.20.0.5`) to try the app without extra config? Run `docker-compose up` normally, then share `http://<your-ip>:5173`. The frontend now points to the backend running on the same host automatically, and the backend (when `CORS_ORIGIN` is empty and `NODE_ENV=development`) accepts requests from any origin on your LAN. For stricter setups, explicitly set `VITE_API_URL` (frontend) and `CORS_ORIGIN` (backend) to the domains you expect.

## 🔐 Production Security Notes

- Set strong secrets (`COOKIE_SECRET`, `JWT_SECRET`) and explicit `CORS_ORIGIN` values.
- Disable default admin seeding (`SEED_DEFAULT_USER=false`) once you create real accounts.
- Keep Swagger private or disabled in production (`ENABLE_SWAGGER=false`).
- Start pgAdmin only when needed with `docker compose --profile tools up` (see `docker-compose.yml`).

## 🔧 Development Setup (Without Docker)

If you prefer to run services locally without Docker:

### Backend Setup

```bash
cd backend
npm install

# Set up environment variables
export DATABASE_URL="postgresql://user:password@localhost:5432/shl"
export HOST="0.0.0.0"         # exposes the API on all interfaces
export PORT="3000"
# Optional: restrict allowed frontends (comma-separated list)
export CORS_ORIGIN="http://localhost:5173"

# Generate Prisma client and sync database
npm run prisma:sync

# Start development server
npm run dev
```

The backend will run on http://localhost:3000

### Frontend Setup

```bash
cd frontend
npm install

# Set up environment variables
# Leave empty to auto-detect http(s)://<host>:3000
export VITE_API_URL=""

# Start development server
npm run dev
```

The frontend will run on http://localhost:5173

## 📝 Available Commands

### Backend Commands
- `npm run dev` — Start development server with hot reload
- `npm run build` — Compile TypeScript to JavaScript
- `npm test` — Run TypeScript type checking
- `npm run prisma:generate` — Generate Prisma client
- `npm run prisma:sync` — Generate client and push schema to database
- `npm run prisma:migrate` — Create and apply database migrations

### Frontend Commands
- `npm run dev` — Start Vite development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build locally

## 🗂️ Project Structure

```
Shl/
├── .github/
│   └── workflows/
│       └── ci.yml          # CI/CD pipeline configuration
├── backend/
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── main.ts         # Express server entry point
│   │   ├── modules/        # Feature modules (login, register, session)
│   │   ├── middlewares/    # Auth middleware
│   │   └── shared/         # Shared utilities
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.ts         # Vue app entry point
│   │   ├── App.vue         # Root component
│   │   ├── components/     # Reusable Vue components
│   │   ├── views/          # Page components
│   │   ├── router/         # Vue Router configuration
│   │   └── stores/         # Pinia state stores
│   └── package.json
├── docker-compose.yml      # Docker services configuration
└── README.md              # This file
```

## 🔐 Default Credentials

A default user is seeded automatically when the backend starts:

- **Email**: Check the `seedDefaultUser` function in the backend
- **Role**: ADMIN

## 🐛 Troubleshooting

### Port Already in Use
If you get port conflicts, you can modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Use port 3001 instead of 3000
```

### Database Connection Issues
Ensure PostgreSQL is healthy:

```bash
docker-compose ps
```

All services should show "healthy" or "running" status.

### Prisma Client Not Generated
If you see Prisma client errors:

```bash
docker-compose exec backend npm run prisma:generate
```

## 📚 Learn More

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 📄 License

This project is open source and available for educational purposes.

## 👥 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
