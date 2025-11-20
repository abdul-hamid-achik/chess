# Chess - Personal Chess Application

A modern, full-stack chess application built with Next.js 16, featuring authentication, game persistence, puzzles, and learning tools.

## Features

### ✅ Completed
- **Authentication System** (Auth.js v5 + Drizzle)
  - Email/password sign-up and sign-in
  - Protected routes with middleware
  - Session management

- **Chess Game**
  - Play against AI with 4 difficulty levels
  - Time controls (Bullet, Blitz, Rapid, Classical)
  - Move history and captured pieces tracking
  - Game timers with timeout detection
  - Automatic game saving on completion
  - Rating system (+10/-10 per win/loss)

- **Game Persistence** ✨ NEW
  - Automatic save to database when games finish
  - Complete game history with PGN notation
  - Interactive game replay with move navigation
  - View all past games on profile page

- **Statistics Dashboard** ✨ NEW
  - Total games played
  - Win/loss/draw tracking
  - Win rate percentage
  - Real-time rating updates
  - Game history with results

- **Advanced Statistics & Charts** ✨ NEW
  - Rating history progression line chart
  - Performance distribution pie chart (win/loss/draw)
  - Time control performance comparison (bullet, blitz, rapid, classical)
  - Game activity trends over time
  - Puzzle progress and accuracy tracking
  - Time range filters (7 days, 30 days, all time)
  - Interactive recharts visualizations
  - Empty states for new users

- **Puzzles Trainer** ✨ NEW
  - 30 curated tactical puzzles (rating 800-2150)
  - Interactive puzzle solver with move validation
  - Difficulty filters (Easy, Medium, Hard)
  - Progress tracking and statistics
  - Puzzle rating system
  - Hints and skip functionality
  - Multiple tactical themes (fork, pin, mate, etc.)

- **Opening Repertoire System** ✨ NEW
  - 70+ chess openings with comprehensive coverage (1.e4, 1.d4, Flank openings)
  - ECO codes and detailed descriptions for each opening
  - Interactive chessboard showing opening positions
  - Move-by-move playthrough with navigation controls
  - Add openings to personal repertoire (separate for White/Black)
  - Personal notes for each opening
  - Practice statistics tracking (times played, last practiced)
  - Search and filter functionality
  - Popular variations for each opening
  - Tabbed interface (Browse / My Repertoire)

- **Modern UI**
  - Dark/light mode support
  - Responsive design with Tailwind CSS
  - 57 shadcn/ui components
  - Feature-based component organization

- **Database Schema** (Drizzle ORM + PostgreSQL)
  - Users and authentication tables
  - Games and moves storage
  - Puzzles system
  - Opening repertoire
  - Game analysis

### 🚧 Coming Soon
- Advanced game analysis with engine evaluation
- Opening practice mode with move validation
- More puzzle content (expand to 100+ puzzles)
- Export statistics and game data

## Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Auth.js v5 (NextAuth)
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui + Radix UI
- **Chess Logic**: chess.js
- **Chess Board**: react-chessboard
- **Forms**: react-hook-form + zod
- **Package Manager**: pnpm

## Project Structure

```
chess/
├── app/
│   ├── (auth)/                   # Authentication routes
│   │   ├── sign-in/             # Sign-in page
│   │   ├── sign-up/             # Sign-up page
│   │   └── layout.tsx
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── play/                # Main chess game
│   │   ├── puzzles/             # Puzzle trainer
│   │   ├── learn/               # Opening repertoire
│   │   ├── profile/             # User profile & stats
│   │   ├── analysis/            # Game analysis
│   │   └── layout.tsx           # Dashboard layout with sidebar
│   ├── api/
│   │   └── auth/[...nextauth]/  # Auth.js API route
│   ├── globals.css
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Redirects to /play
│
├── components/
│   ├── features/                # Feature-specific components
│   │   ├── auth/               # Sign-in/up forms
│   │   ├── game/               # Chess game components
│   │   ├── puzzles/            # Puzzle components
│   │   ├── analysis/           # Analysis components
│   │   ├── profile/            # Profile components
│   │   └── learn/              # Learning components
│   ├── ui/                     # shadcn/ui components (57 components)
│   └── shared/                 # Shared components
│       ├── sidebar.tsx
│       └── theme-provider.tsx
│
├── lib/
│   ├── db/                     # Database
│   │   ├── schema.ts          # Drizzle schema
│   │   ├── index.ts           # Database connection
│   │   └── migrations/        # Database migrations
│   ├── auth/                   # Authentication
│   │   ├── config.ts          # Auth.js configuration
│   │   └── actions.ts         # Auth server actions
│   ├── chess/                  # Chess logic
│   │   └── engine.ts          # AI engine with minimax
│   └── utils.ts               # Utility functions
│
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript types
├── middleware.ts               # Auth middleware
├── drizzle.config.ts          # Drizzle configuration
└── .env.local.example         # Environment variables template
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

### 1. Clone and Install

```bash
cd /path/to/chess
pnpm install
```

### 2. Setup Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:
```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/chess"

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
```

### 3. Setup Database

Generate and push the database schema:

```bash
# Generate migration files
pnpm db:generate

# Push schema to database
pnpm db:push

# Optional: Open Drizzle Studio to view your database
pnpm db:studio
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Core Tables
- **users** - User accounts with ratings
- **accounts**, **sessions**, **verificationTokens** - Auth.js tables
- **games** - Completed chess games with results
- **puzzles** - Chess tactical puzzles
- **user_puzzles** - User puzzle progress
- **openings** - Opening repertoire database
- **user_openings** - User's selected openings
- **game_analysis** - Post-game analysis data

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database scripts
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
pnpm db:seed      # Seed database with initial data (puzzles, etc.)
```

### Database Seeding

The project uses a modular seeding system. You can seed all data or specific datasets:

```bash
# Seed everything
pnpm db:seed

# Seed only puzzles
pnpm db:seed puzzles

# Seed specific datasets
pnpm db:seed puzzles openings
```

See `lib/db/seeds/README.md` for more information on the seeding system.

## Features Guide

### Authentication
1. Visit `/sign-up` to create an account
2. Sign in at `/sign-in`
3. All dashboard routes are protected

### Play Chess
- **Location**: `/play`
- Choose difficulty (Basic, Intermediate, Advanced, Pro)
- Select your color (White, Black, Random)
- Pick time control (Bullet, Blitz, Rapid, Classical)
- Play against AI with minimax algorithm

### Puzzles
- **Location**: `/puzzles`
- Solve 30 curated tactical puzzles (rating 800-2150)
- Interactive board with move validation
- Filter by difficulty (Easy, Medium, Hard, All)
- Track your progress, accuracy, and puzzle rating
- Use hints when stuck or skip difficult puzzles
- Themes include: forks, pins, skewers, mate patterns, and more

### Learn (Opening Repertoire)
- **Location**: `/learn`
- Browse 70+ chess openings from comprehensive library
- Study opening positions with interactive chessboard
- Add openings to your personal repertoire (White/Black)
- Add personal notes for each opening
- Track practice statistics (times played, last practiced)
- Search and filter openings by name, ECO code, or description
- View detailed variations for each opening
- Move-by-move navigation through opening sequences

### Profile & Stats
- **Location**: `/profile`
- View your chess rating and puzzle rating
- Game history with replay links
- Win/loss/draw statistics and win rate
- Puzzles solved and accuracy percentage
- **Performance Charts & Analytics**:
  - Rating progression over time with trend indicators
  - Win/loss/draw distribution visualization
  - Performance breakdown by time control
  - Game activity heatmap by day/week
  - Puzzle accuracy trends
  - Time range filtering (last 7 days, 30 days, or all time)

### Analysis (Planned)
- **Location**: `/analysis`
- Post-game analysis
- Move-by-move review
- Mistake detection
- Accuracy calculation

## Architecture Decisions

### Why Feature-Based Organization?
Components are organized by feature rather than type, making it easier to:
- Locate related files
- Understand feature boundaries
- Scale the application
- Work on features independently

### Why Drizzle ORM?
- Type-safe SQL queries
- Excellent TypeScript support
- Lightweight and performant
- Great DX with Drizzle Studio

### Why Auth.js v5?
- Industry-standard authentication
- Built-in adapter for Drizzle
- Flexible and extensible
- Supports multiple providers

## Development Roadmap

### Phase 1: Core Features ✅
- [x] Project structure reorganization
- [x] Authentication system
- [x] Database schema
- [x] All page routes created

### Phase 2: Game Persistence ✅
- [x] Save completed games to database
- [x] Load and replay games
- [x] Game history on profile page

### Phase 3: Puzzles System ✅
- [x] Puzzle database seeding (30 puzzles)
- [x] Interactive puzzle solver
- [x] Progress tracking
- [x] Rating system
- [x] Difficulty filtering
- [x] Hints and skip functionality

### Phase 4: Analysis Engine
- [ ] Post-game analysis
- [ ] Move evaluation
- [ ] Mistake detection
- [ ] Best move suggestions

### Phase 5: Learning Tools ✅
- [x] Opening database (70+ openings seeded)
- [x] Opening repertoire browser with search/filters
- [x] Repertoire builder (add to White/Black repertoire)
- [x] Opening statistics and tracking
- [x] Interactive chessboard with move navigation
- [x] Personal notes for each opening
- [ ] Opening practice mode with move validation (planned)

### Phase 6: Advanced Statistics ✅
- [x] Performance charts with recharts
- [x] Rating progression visualization
- [x] Win/loss analytics and distribution
- [x] Time control performance comparison
- [x] Game activity tracking
- [x] Puzzle progress charts
- [x] Time range filters
- [ ] Export capabilities (planned)

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT License - feel free to use this project as a template for your own chess application.

## Acknowledgments

- Chess engine based on minimax algorithm with alpha-beta pruning
- UI components from shadcn/ui
- Chess logic powered by chess.js
- Board rendering with react-chessboard
