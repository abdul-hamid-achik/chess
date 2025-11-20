# Setup Guide

Follow these steps to get your chess application up and running.

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Setup PostgreSQL Database

You need a PostgreSQL database. Here are some options:

### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb chess
```

### Option B: Docker
```bash
docker run --name chess-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=chess \
  -p 5432:5432 \
  -d postgres:16
```

### Option C: Hosted Services
- [Neon](https://neon.tech) - Free tier available
- [Supabase](https://supabase.com) - Free tier available
- [Railway](https://railway.app) - Free tier available
- [Vercel Postgres](https://vercel.com/storage/postgres) - Pay as you go

## Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# Database URL
DATABASE_URL="postgresql://user:password@localhost:5432/chess"

# For Neon/hosted services, use the connection string they provide
# DATABASE_URL="postgresql://user:pass@host.neon.tech/chess?sslmode=require"

# Auth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32

# Optional: Node Environment
NODE_ENV="development"
```

### Generate NEXTAUTH_SECRET

```bash
# macOS/Linux
openssl rand -base64 32

# Or use this Node.js command
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 4: Setup Database Schema

Push the database schema to your PostgreSQL database:

```bash
# Generate migration files (optional, for version control)
pnpm db:generate

# Push schema directly to database (recommended for development)
pnpm db:push
```

You should see output confirming the tables were created:
- user
- account
- session
- verificationToken
- game
- puzzle
- user_puzzle
- opening
- user_opening
- game_analysis

## Step 5: Verify Database (Optional)

Open Drizzle Studio to view your database:

```bash
pnpm db:studio
```

This opens a UI at `https://local.drizzle.studio` where you can:
- View all tables
- See the schema
- Browse data
- Run queries

## Step 6: Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Step 7: Create Your First Account

1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/sign-in`
3. Click "Sign up" link
4. Create an account with:
   - Name
   - Email
   - Password (min 6 characters)
5. After signing up, you'll be automatically signed in and redirected to `/play`

## Troubleshooting

### Database Connection Issues

**Error: "DATABASE_URL environment variable is not set"**
- Make sure `.env.local` exists
- Check that `DATABASE_URL` is set correctly
- Restart the dev server after changing `.env.local`

**Error: "connect ECONNREFUSED"**
- Check that PostgreSQL is running
- Verify the host, port, username, and password in your DATABASE_URL
- For hosted services, check if your IP is whitelisted

### Authentication Issues

**Error: "NEXTAUTH_SECRET is not set"**
- Generate a secret: `openssl rand -base64 32`
- Add it to `.env.local` as `NEXTAUTH_SECRET="your-generated-secret"`
- Restart the dev server

**Can't sign in after creating account**
- Check the browser console for errors
- Verify the database tables were created correctly
- Check that the `user` table has your account

### Build Issues

**TypeScript errors**
- Run `pnpm install` to ensure all dependencies are installed
- Check that `typescript` version matches `package.json`

**Import errors**
- Clear Next.js cache: `rm -rf .next`
- Restart the dev server

## Database Management Commands

```bash
# Push schema changes to database (development)
pnpm db:push

# Generate migration files
pnpm db:generate

# Apply migrations (production)
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
4. Deploy!

### Other Platforms

The app works on any platform that supports:
- Node.js 18+
- PostgreSQL connection
- Environment variables

Supported platforms:
- Vercel
- Netlify
- Railway
- Render
- Fly.io
- Your own VPS

## Next Steps

Once the app is running:

1. **Play Chess**: Go to `/play` and start a game against the AI
2. **Try Different Difficulty Levels**: Test Basic, Intermediate, Advanced, and Pro
3. **Explore Time Controls**: Try Bullet, Blitz, Rapid, and Classical modes
4. **View Your Profile**: Check `/profile` to see your rating and stats
5. **Explore Other Pages**: Visit `/puzzles`, `/learn`, and `/analysis` (placeholders for now)

## Development Workflow

### Making Schema Changes

1. Edit `lib/db/schema.ts`
2. Generate migration: `pnpm db:generate`
3. Apply changes: `pnpm db:push`
4. Verify in Drizzle Studio: `pnpm db:studio`

### Adding New Features

1. Create components in `components/features/[feature-name]/`
2. Add pages in `app/(dashboard)/[page-name]/`
3. Update sidebar links in `components/shared/sidebar.tsx`
4. Add database tables if needed in `lib/db/schema.ts`

### Testing Authentication

```typescript
// In a server component
import { auth } from "@/lib/auth/config"

export default async function Page() {
  const session = await auth()
  console.log(session?.user)
  // ...
}

// In a client component
"use client"
import { useSession } from "next-auth/react"

export function Component() {
  const { data: session } = useSession()
  console.log(session?.user)
  // ...
}
```

## Need Help?

- Check the [README.md](README.md) for project overview
- Review the code in `lib/`, `components/`, and `app/` folders
- Database schema is documented in `lib/db/schema.ts`
- Authentication config is in `lib/auth/config.ts`
