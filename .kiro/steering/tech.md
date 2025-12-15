# Tech Stack

## Frontend
- React 19 with TypeScript
- Vite for bundling and dev server
- Tailwind CSS v4 for styling
- Radix UI primitives with shadcn/ui components
- wouter for routing
- TanStack Query + tRPC for data fetching

## Backend
- Express.js server
- tRPC for type-safe API layer
- Drizzle ORM with MySQL database
- Zod for input validation
- superjson for serialization

## Key Libraries
- Monaco Editor for Markdown editing
- Puppeteer Core for PDF rendering
- remark/unified for Markdown parsing
- Framer Motion for animations

## Package Manager
pnpm (v10.4.1)

## Common Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Build & Production
pnpm build            # Build client (Vite) and server (esbuild)
pnpm start            # Run production server

# Code Quality
pnpm check            # TypeScript type checking
pnpm format           # Prettier formatting
pnpm test             # Run tests with Vitest

# Database
pnpm db:push          # Generate and run Drizzle migrations
```

## Environment Variables
- `DATABASE_URL` - MySQL connection string (required for DB operations)
- `BUILT_IN_FORGE_API_URL` - Storage proxy URL
- `BUILT_IN_FORGE_API_KEY` - Storage proxy API key
