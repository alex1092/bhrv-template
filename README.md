# bhvr 🦫

![cover](https://cdn.stevedylan.dev/ipfs/bafybeievx27ar5qfqyqyud7kemnb5n2p4rzt2matogi6qttwkpxonqhra4)

A full-stack TypeScript monorepo starter with Better Auth authentication, using Bun, Hono, Cloudflare Workers, and React

> **📝 Note**: This is a fork of the excellent [bhvr](https://github.com/stevedylandev/bhvr) template by [@stevedylandev](https://github.com/stevedylandev), enhanced with Better Auth authentication and Cloudflare Workers deployment.

## Features

- **🔐 Complete Authentication System**: Better Auth with email/password, session management, and database persistence
- **☁️ Cloudflare Workers Ready**: Pre-configured for serverless deployment with Wrangler
- **🗄️ Database Integration**: Drizzle ORM with Neon PostgreSQL for type-safe database operations
- **🔗 Full-Stack TypeScript**: End-to-end type safety between client and server
- **📦 Shared Types**: Common type definitions shared between client and server
- **🏗️ Monorepo Structure**: Organized workspaces-based monorepo
- **⚡ Modern Stack**:
  - [Bun](https://bun.sh) as the JavaScript runtime
  - [Hono](https://hono.dev) as the backend framework
  - [Better Auth](https://www.better-auth.com) for authentication
  - [Drizzle ORM](https://orm.drizzle.team) for database operations
  - [Cloudflare Workers](https://workers.cloudflare.com) for serverless deployment
  - [Neon](https://neon.tech) for PostgreSQL database
  - [Vite](https://vitejs.dev) for frontend bundling
  - [React](https://react.dev) for the frontend UI

## Project Structure

```
.
├── client/               # React frontend
├── server/               # Hono backend with Better Auth
│   ├── src/
│   │   ├── db/          # Database schema and migrations
│   │   ├── lib/         # Better Auth configuration
│   │   └── index.ts     # Main server entry point
│   ├── drizzle/         # Database migration files
│   ├── wrangler.jsonc   # Cloudflare Workers config
│   └── .dev.vars        # Environment variables (local)
├── shared/               # Shared TypeScript definitions
└── package.json          # Root package.json with workspaces
```

## Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd bhvr-template

# Install dependencies for all workspaces
bun install
```

### 2. Environment Setup

Create your environment variables file:

```bash
# Copy the example environment file
cp server/.dev.vars.example server/.dev.vars
```

Edit `server/.dev.vars` with your actual values:

```bash
# Database
DATABASE_URL=postgresql://username:password@host/database

# Authentication
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-key-here

# Optional: GitHub OAuth (for social login)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3. Database Setup

Set up your Neon PostgreSQL database:

1. Create a [Neon](https://neon.tech) account
2. Create a new project and database
3. Copy the connection string to your `.dev.vars` file
4. Run the database migrations:

```bash
cd server
npm run better-auth-gen-schema  # Generate auth schema
npx drizzle-kit generate        # Generate migrations
npx drizzle-kit migrate         # Apply migrations
```

### 4. Development

```bash
# Run everything in development mode
bun run dev

# Or run individual parts
bun run dev:shared  # Watch and compile shared types
bun run dev:server  # Run the Hono backend (localhost:3000)
bun run dev:client  # Run the Vite dev server (localhost:5173)
```

Your development servers will be running at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Auth API**: http://localhost:3000/api/*

## Authentication Features

This template includes a complete authentication system powered by Better Auth:

### Available Auth Endpoints

- `POST /api/sign-up` - User registration
- `POST /api/sign-in` - User login
- `POST /api/sign-out` - User logout
- `GET /api/session` - Get current session
- `POST /api/forgot-password` - Password reset
- `POST /api/reset-password` - Reset password with token

### Database Schema

The following tables are automatically created:

- **users** - User accounts and profiles
- **sessions** - Active user sessions
- **accounts** - Social provider accounts (OAuth)
- **verification** - Email verification and password reset tokens

### Usage Example

```typescript
// Frontend authentication example
const response = await fetch('/api/sign-up', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword',
    name: 'John Doe'
  })
});

const result = await response.json();
```

## Deployment

### Cloudflare Workers Deployment

This template is pre-configured for Cloudflare Workers deployment:

#### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

#### 2. Login to Cloudflare

```bash
wrangler login
```

#### 3. Set Production Environment Variables

```bash
# Set your production secrets
echo "your-production-secret" | wrangler secret put BETTER_AUTH_SECRET
echo "your-production-db-url" | wrangler secret put DATABASE_URL
echo "https://your-domain.workers.dev" | wrangler secret put BETTER_AUTH_URL
```

#### 4. Deploy

```bash
cd server

# Quick deploy
npm run deploy

# Full deploy (with secrets update)
npm run deploy:full

# View live logs
npm run logs
```

### Deployment Scripts

| Command | Description |
|---------|-------------|
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npm run deploy:quick` | Deploy without building |
| `npm run deploy:full` | Build, update secrets, and deploy |
| `npm run deploy:secrets` | Update environment variables only |
| `npm run logs` | View live deployment logs |
| `npm run status` | Check deployment status |

### Frontend Deployment

Deploy your React frontend to any static hosting service:

**Recommended Options:**
- [Cloudflare Pages](https://pages.cloudflare.com)
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [GitHub Pages](https://pages.github.com)

```bash
# Build the frontend
cd client
npm run build

# Deploy the dist/ folder to your hosting service
```

## Development Workflow

### 1. Making Changes

```bash
# Make your code changes
git add .
git commit -m "feat: add new feature"
```

### 2. Testing Locally

```bash
# Test the server
cd server
npm run dev

# Test the client
cd client
npm run dev
```

### 3. Deploy to Production

```bash
# Deploy server
cd server
npm run deploy

# Deploy client (example with Cloudflare Pages)
cd client
npm run build
# Upload dist/ to your hosting service
```

## Database Management

### Adding New Tables

1. Modify the schema in `server/src/db/schema.ts`
2. Generate migrations:
   ```bash
   cd server
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

### Viewing Database

```bash
cd server
npx drizzle-kit studio  # Opens database viewer in browser
```

## Customization

### Adding Social Providers

Edit `server/src/lib/better-auth/options.ts`:

```typescript
export const betterAuthOptions: BetterAuthOptions = {
  appName: "Your App Name",
  basePath: "/api",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
};
```

### Custom API Routes

Add new routes in `server/src/index.ts`:

```typescript
import { auth } from "./lib/better-auth";
import { Hono } from "hono";

export const app = new Hono()
  .use(cors())
  
  // Your custom API routes
  .get("/api/protected", async (c) => {
    const session = await auth(c.env).api.getSession({
      headers: c.req.headers
    });
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    return c.json({ message: "Protected data", user: session.user });
  });
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `BETTER_AUTH_SECRET` | Secret key for JWT signing | `your-32-char-secret-key` |
| `BETTER_AUTH_URL` | Base URL of your application | `https://yourdomain.com` |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

## Troubleshooting

### Common Issues

**Database Connection Error:**
- Verify your `DATABASE_URL` is correct
- Ensure your Neon database is running
- Check if migrations have been applied

**Authentication Not Working:**
- Verify `BETTER_AUTH_SECRET` is set
- Check `BETTER_AUTH_URL` matches your domain
- Ensure database schema is up to date

**Deployment Fails:**
- Run `wrangler login` to authenticate
- Verify all secrets are set with `wrangler secret list`
- Check build logs with `npm run logs`

### Getting Help

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Hono Documentation](https://hono.dev/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## Credits & Acknowledgments

This template is built upon the fantastic work of:

- **[@stevedylandev](https://github.com/stevedylandev)** - Creator of the original [bhvr](https://github.com/stevedylandev/bhvr) template
- **[Better Auth](https://www.better-auth.com)** - Modern authentication library
- **[Cloudflare Workers](https://workers.cloudflare.com)** - Serverless computing platform
- **[Drizzle ORM](https://orm.drizzle.team)** - TypeScript ORM
- **[Neon](https://neon.tech)** - Serverless PostgreSQL

### What's Added to the Original BHVR

This fork enhances the original bhvr template with:

- ✅ **Complete Authentication System** with Better Auth
- ✅ **Database Integration** with Drizzle ORM + PostgreSQL
- ✅ **Cloudflare Workers Deployment** with Wrangler
- ✅ **Production-Ready Configuration** 
- ✅ **Database Migrations & Schema Management**
- ✅ **Environment Variable Management**
- ✅ **Deployment Scripts & CI/CD Ready**

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m "feat: add new feature"`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

### Original License

This project is based on [bhvr](https://github.com/stevedylandev/bhvr) by Steve Dylan, also licensed under the MIT License.